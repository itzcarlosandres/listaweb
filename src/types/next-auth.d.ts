import { Role, Plan } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
      plan: Plan;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: Role;
    plan?: Plan;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: Role;
    plan?: Plan;
  }
}
