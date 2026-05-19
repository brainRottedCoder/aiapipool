import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      balance: string;
      status: "active" | "suspended";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "user" | "admin";
    balance?: string;
    status?: "active" | "suspended";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin";
  }
}
