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

const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
);
const facebookEnabled = Boolean(
  process.env.AUTH_FACEBOOK_ID?.trim() &&
    process.env.AUTH_FACEBOOK_SECRET?.trim(),
);

/**
 * Google/Facebook emails that always receive ADMIN on OAuth sign-in.
 * Override with ADMIN_OAUTH_EMAILS=comma,separated@emails
 */
const DEFAULT_ADMIN_OAUTH_EMAILS = [
  "rdevinmcbride@gmail.com",
  "janineneely@gmail.com",
];

const ADMIN_OAUTH_EMAILS = new Set(
  (process.env.ADMIN_OAUTH_EMAILS?.trim()
    ? process.env.ADMIN_OAUTH_EMAILS.split(",")
    : DEFAULT_ADMIN_OAUTH_EMAILS
  )
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

function isAdminOauthEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_OAUTH_EMAILS.has(email.trim().toLowerCase());
}

/**
 * Production origin for Auth.js cookies / redirects.
 * Prefer AUTH_URL; fall back to Netlify's deployed URL when unset.
 */
function resolveAuthUrl(): string | undefined {
  const explicit = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  // Netlify provides deploy URL without protocol sometimes as URL / DEPLOY_PRIME_URL
  const netlify =
    process.env.URL?.trim() ||
    process.env.DEPLOY_PRIME_URL?.trim() ||
    process.env.DEPLOY_URL?.trim();
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
 * - Google/Facebook OAuth → CUSTOMER by default
 * - Listed emails in ADMIN_OAUTH_EMAILS → full ADMIN via OAuth
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
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(facebookEnabled
      ? [
          Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID!,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth: promote allowlisted emails to ADMIN; everyone else stays CUSTOMER
      // (never demote an existing ADMIN, e.g. seed admin who linked Google).
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.id) return true;

        const email = (user.email ?? "").trim().toLowerCase();
        if (isAdminOauthEmail(email)) {
          await db.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          (user as { role?: string }).role = "ADMIN";
          return true;
        }

        const existing = await db.user.findUnique({ where: { id: user.id } });
        if (existing?.role === "ADMIN") {
          return true;
        }
        if (existing && existing.role !== "CUSTOMER") {
          await db.user.update({
            where: { id: user.id },
            data: { role: "CUSTOMER" },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;

        // Prefer role set during signIn (e.g. OAuth admin allowlist)
        const roleFromUser = (user as { role?: string }).role;
        if (roleFromUser) {
          token.role = roleFromUser;
        } else if (isAdminOauthEmail(user.email)) {
          token.role = "ADMIN";
        } else if (user.id) {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "CUSTOMER";
        } else {
          token.role = "CUSTOMER";
        }
      }

      if (
        account &&
        (account.provider === "google" || account.provider === "facebook")
      ) {
        if (token.sub) {
          // Re-read after signIn may have promoted role
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, name: true, email: true, image: true },
          });
          const email = dbUser?.email ?? (token.email as string | undefined);
          if (isAdminOauthEmail(email)) {
            token.role = "ADMIN";
            if (dbUser && dbUser.role !== "ADMIN") {
              await db.user.update({
                where: { id: token.sub },
                data: { role: "ADMIN" },
              });
            }
          } else {
            token.role = dbUser?.role ?? "CUSTOMER";
          }
          if (dbUser?.name) token.name = dbUser.name;
          if (dbUser?.email) token.email = dbUser.email;
          if (dbUser?.image) token.picture = dbUser.image;
        }
      }

      if (trigger === "update" && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true, email: true },
        });
        if (isAdminOauthEmail(dbUser?.email ?? (token.email as string))) {
          token.role = "ADMIN";
        } else {
          token.role = dbUser?.role ?? token.role ?? "CUSTOMER";
        }
      }

      if (!token.role && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true, email: true },
        });
        token.role = isAdminOauthEmail(dbUser?.email)
          ? "ADMIN"
          : (dbUser?.role ?? "CUSTOMER");
      }

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
  google: googleEnabled,
  facebook: facebookEnabled,
} as const;
