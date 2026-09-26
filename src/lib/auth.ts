import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  /** Dev-friendly admin username (currently only "admin") */
  username: z.string().min(1),
  password: z.string().min(1),
});

/** Read at call time so a build without these keys does not freeze them empty. */
function envValue(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function googleConfigured() {
  return Boolean(envValue("AUTH_GOOGLE_ID") && envValue("AUTH_GOOGLE_SECRET"));
}

function facebookConfigured() {
  return Boolean(
    envValue("AUTH_FACEBOOK_ID") && envValue("AUTH_FACEBOOK_SECRET"),
  );
}

/**
 * Production origin for Auth.js cookies / redirects.
 * Prefer AUTH_URL; fall back to Netlify's deployed URL when unset.
 */
function resolveAuthUrl(): string | undefined {
  const explicit = envValue("AUTH_URL") || envValue("NEXTAUTH_URL");
  if (explicit) return explicit.replace(/\/$/, "");

  // Netlify provides deploy URL without protocol sometimes as URL / DEPLOY_PRIME_URL
  const netlify =
    envValue("URL") || envValue("DEPLOY_PRIME_URL") || envValue("DEPLOY_URL");
  if (netlify) {
    return netlify.replace(/\/$/, "");
  }
  return undefined;
}

const authUrl = resolveAuthUrl();
if (authUrl && !process.env.AUTH_URL) {
  // Auth.js reads AUTH_URL / NEXTAUTH_URL from env at runtime
  process.env.AUTH_URL = authUrl;
}
if (authUrl && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = authUrl;
}

/**
 * Auth.js (next-auth v5) — JWT sessions for serverless (Netlify).
 * - Admin credentials: username "admin" + password
 * - Google/Facebook OAuth keeps the role already stored on the User row
 * - OAuth never promotes a user to ADMIN
 *
 * Adapter persists OAuth users/accounts; session strategy stays JWT
 * so edge-less Node functions don't need DB sessions on every request.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Auth adapter accepts Prisma client
  adapter: PrismaAdapter(db as any),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
  },
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const username = parsed.data.username.trim().toLowerCase();
        if (username !== "admin") return null;

        const user = await db.user.findFirst({
          where: { role: "ADMIN" },
          orderBy: { createdAt: "asc" },
        });
        if (!user?.passwordHash) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(googleConfigured()
      ? [
          Google({
            clientId: envValue("AUTH_GOOGLE_ID"),
            clientSecret: envValue("AUTH_GOOGLE_SECRET"),
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(facebookConfigured()
      ? [
          Facebook({
            clientId: envValue("AUTH_FACEBOOK_ID"),
            clientSecret: envValue("AUTH_FACEBOOK_SECRET"),
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const id = user?.id ?? token.sub;
      if (user?.id) token.sub = user.id;
      if (user?.email) token.email = user.email;

      if (!id) {
        token.role = "CUSTOMER";
        return token;
      }

      const dbUser = await db.user.findUnique({
        where: { id },
        select: { role: true, email: true, name: true, image: true },
      });
      token.role = dbUser?.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
      if (dbUser?.email) token.email = dbUser.email;
      if (dbUser?.name) token.name = dbUser.name;
      if (dbUser?.image) token.picture = dbUser.image;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
  },
});

export const oauthProviders = {
  get google() {
    return googleConfigured();
  },
  get facebook() {
    return facebookConfigured();
  },
};
