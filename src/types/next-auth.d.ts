import { DefaultSession } from "next-auth";
import { Role } from "@/types/enums";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role;
            organizationId?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        role: Role;
        organizationId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        organizationId?: string | null;
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        role?: Role;
        organizationId?: string | null;
    }
}
