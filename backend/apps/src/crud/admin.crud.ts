import { PrismaClient, Role } from '@prisma/client';
import prismaClient from '../prisma/prisma.client';
import { CreateQuery, DeleteQuery, PrismaModelName, RoleUpdateErrors, SelectQuery, UpdateQuery, UserPermissionEntry, UserRoles } from '../types/admin.types';
import { hash } from '../utils/hasher';

export const parseSelectQuery = (query: string): SelectQuery | undefined => {
    const [_, model, type, conditionsString] =
        query.match(/^read (\w+) (\w+) WHERE (.+)$/i) ?? [];

    if (!model || !type || !conditionsString) {
        return;
    }

    const conditions = conditionsString.split(' AND ');

    const where = conditions.reduce((acc: {}, condition: string) => {
        const matches = condition.match(/(\w+)="([^"]+)"/);
        if (matches) {
            const field = matches[1];
            const value = matches[2].replace(/"/g, '');

            acc[field] = value;
        }
        return acc;
    }, {});

    return {
        model: model.toLowerCase(),
        type: type.toLowerCase(),
        where,
    };
};

export const parseCreateQuery = async (query: string): Promise<CreateQuery | undefined> => {
    const [_, model, dataString] = query.match(/^create (\w+) (.+)$/i) ?? [];

    if (!model || !dataString) {
        return;
    }

    const data: Record<string, any> = {};

    const keyValuePairs = dataString.split(' AND ');

    for (const pair of keyValuePairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
            if (key.toLowerCase() === 'password') {
                data[key] = await hash(value.replace(/"/g, ''));
            } else {
                data[key] = value.replace(/"/g, '');
            }
        }
    }

    return {
        model: model.toLowerCase(),
        data,
    };
};

export const parseUpdateQuery = async (query: string): Promise<UpdateQuery | undefined> => {
    const [_, model, updateString, conditionsString] = query.match(/^update (\w+) set (.+) where (.+)$/i) ?? [];

    if (!model || !conditionsString || !updateString) {
        return;
    }

    const conditions = conditionsString.split(' AND ');
    const where = {};

    for (const condition of conditions) {
        const matches = condition.match(/(\w+)="([^"]+)"/);
        if (matches) {
            const field = matches[1];
            if (field.toLowerCase() === 'password') {
                where[field] = await hash(matches[2].replace(/"/g, ''));
            } else {
                where[field] = matches[2];
            }
        }
    }

    const updateData = {};

    for (const update of updateString.split(' AND ')) {
        const matches = update.match(/(\w+)="([^"]+)"/);
        if (matches) {
            const field = matches[1];
            const value = matches[2].replace(/"/g, '');
            updateData[field] = value;
        }
    }

    return {
        model: model.toLowerCase(),
        where,
        data: updateData,
    };
};

export const parseDeleteQuery = (query: string): DeleteQuery | undefined => {
    const [_, model, conditionsString] =
        query.match(/^delete (\w+) where (.+)$/i) ?? [];

    if (!model || !conditionsString) {
        return;
    }

    const conditions = conditionsString.split(' AND ');

    const where = conditions.reduce((acc: {}, condition: string) => {
        const matches = condition.match(/(\w+)="([^"]+)"/);
        if (matches) {
            const field = matches[1];
            const value = matches[2].replace(/"/g, '');

            acc[field] = value;
        }
        return acc;
    }, {});

    return {
        model: model.toLowerCase(),
        where,
    };
};

export const getUsers = async (page: number, rowsPerPage: number): Promise<UserPermissionEntry[]> => {

    const skip = page * rowsPerPage;
    const take = rowsPerPage;

    const user: UserPermissionEntry[] = (await prismaClient.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
        },
        skip,
        take,
    }));

    if (!user) return [];

    return user;
};

export const deleteUsers = async (ids: string[]) => {
    const deletedUsers = await prismaClient.user.deleteMany({
        where: {
            id: {
                in: ids
            }
        }
    });

    return deleteUsers;
}

export const updateRoles = async (roles: UserRoles[]): Promise<{ success: number; errors: RoleUpdateErrors; }> => {
    let success = 0;
    const errors: RoleUpdateErrors = {
        count: 0,
        ids: [],
    };
    for (const { id, role } of roles) {
        try {
            await prismaClient.user.update({
                where: { id },
                data: { role: { set: role as Role } },
            });

            success += 1;
        } catch {
            errors.count += 1;
            errors.ids = [...errors.ids, id];
            continue;
        }
    }

    return {
        success,
        errors
    };
};

export const getCount = async (model: PrismaModelName) => {
    try {
        const count = await (prismaClient[model as keyof PrismaClient] as {
            count: () => Promise<number>;
        }).count();

        return count;
    } catch {
        return 'N/A';
    }
};

export const getRoleCount = async (role: Role) => {
    try {
        const count = await (prismaClient.user.count({
            where: { role },
        }));

        return count;
    } catch {
        return 'N/A';
    }
}
