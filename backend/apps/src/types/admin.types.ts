import { PrismaClient, Role } from '@prisma/client';

export interface SelectQuery {
    model: string;
    type: string;
    where: Record<string, any>;
};

export interface CreateQuery {
    model: string;
    data: Record<string, any>;
};

export interface UpdateQuery {
    model: string;
    where: Record<string, any>;
    data: Record<string, any>;
};

export interface DeleteQuery {
    model: string;
    where: Record<string, any>;
};

export interface UserPermissionEntry {
    id: string;
    email: string;
    role: Role;
};

export interface UserRoles {
    id: string;
    role: string;
};

export interface RoleUpdateErrors {
    count: number;
    ids: string[];
};

export interface GenericCount {
    [key: string]: number | 'N/A';
}

export interface Stats {
    models: GenericCount;
    roles: GenericCount;
};

type IgnorePrismaBuiltins<S extends string> = string extends S
    ? string
    : S extends ''
    ? S
    : S extends `$${infer T}`
    ? never
    : S;

export type PrismaModelName = IgnorePrismaBuiltins<keyof PrismaClient>;
