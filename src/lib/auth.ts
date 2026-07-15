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
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);
const facebookEnabled = Boolean(
  process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET,
);

/**
 * Auth.js config
 * - Admin: username + password (credentials) — username "admin"
 * - Customers: Google / Facebook OAuth → role CUSTOMER
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Auth adapter accepts Prisma client
  adapter: PrismaAdapter(db as any),
  trustHost: true,
  session: { strategy: "jwt" },
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
      // OAuth: ensure customer role (never create admins via social login)
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.id) return true;
        const existing = await db.user.findUnique({ where: { id: user.id } });
        if (existing?.role === "ADMIN") {
          // Keep admin role if this Google/Facebook account is already the admin user
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
        const roleFromUser = (user as { role?: string }).role;
        if (roleFromUser) {
          token.role = roleFromUser;
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

      // OAuth first login: adapter created user; load role
      if (account && (account.provider === "google" || account.provider === "facebook")) {
        if (token.sub) {
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, name: true, email: true, image: true },
          });
          token.role = dbUser?.role ?? "CUSTOMER";
          if (dbUser?.name) token.name = dbUser.name;
          if (dbUser?.email) token.email = dbUser.email;
          if (dbUser?.image) token.picture = dbUser.image;
        }
      }

      // Refresh role from DB occasionally (e.g. after admin promotion)
      if (trigger === "update" && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = dbUser?.role ?? token.role ?? "CUSTOMER";
      }

      if (!token.role && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "CUSTOMER";
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
