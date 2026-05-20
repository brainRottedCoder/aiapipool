import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authAdapter } from "@/lib/auth-adapter";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@fluxai/shared/db-schema";
import bcrypt from "bcryptjs";

// #region agent log
fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
  body: JSON.stringify({
    sessionId: "9cec04",
    runId: "post-fix",
    hypothesisId: "A",
    location: "auth.ts:init",
    message: "Auth env snapshot",
    data: {
      hasSecret: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
      hasGoogleId: Boolean(process.env.GOOGLE_CLIENT_ID),
      hasGoogleSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      nextAuthUrl: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? null,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  adapter: authAdapter,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)
          .then((rows) => rows[0]);

        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          balance: user.balance,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.balance = (user as unknown as { balance: string }).balance;
        session.user.status = (user as unknown as { status: "active" | "suspended" }).status;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  balance: string;
  status: "active" | "suspended";
};
