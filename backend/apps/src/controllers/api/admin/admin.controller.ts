import { Role } from '@prisma/client';
import { Request, Response } from 'express';
import { deleteUsers, getCount, getRoleCount, getUsers, parseCreateQuery, parseDeleteQuery, parseSelectQuery, parseUpdateQuery, updateRoles } from '../../../crud/admin.crud';
import logger from "../../../middleware/logger";
import prismaClient, { prismaModels } from "../../../prisma/prisma.client";
import { PrismaModelName, Stats } from '../../../types/admin.types';

export const CrudFunctionsController = async (req: Request, res: Response) => {

    const { query } = req.body;

    try {
        const [operation] = query.split(' ');

        if (!operation) {
            throw new Error('Invalid Query Operator');
        }

        switch (operation.toLowerCase()) {
            case 'read': {
                const selectQuery = parseSelectQuery(query);

                if (!selectQuery) {
                    return res.status(400).json({ error: 'Invalid query' });
                }

                let result: any;

                try {
                    if (selectQuery.type === 'first') {
                        result = await prismaClient[selectQuery.model].findFirst({ where: selectQuery.where });
                    } else {
                        result = await prismaClient[selectQuery.model].findMany({ where: selectQuery.where });
                    }
                    return res.status(200).json({ result: result ?? 'No result found.' })
                } catch (err) {
                    throw new Error(`Error querying the database: ${err.message}`);
                }
            }
            case 'create': {
                const createQuery = await parseCreateQuery(query);

                if (!createQuery) {
                    return res.status(400).json({ error: 'Invalid query' });
                }

                try {
                    const result = await prismaClient[createQuery.model].create({
                        data: createQuery.data,
                    });
                    return res.status(200).json({ result });
                } catch (err) {
                    throw new Error(`Error querying the database: ${err.message}`);
                }
            }
            case 'update': {
                const updateQuery = await parseUpdateQuery(query);

                if (!updateQuery) {
                    return res.status(400).json({ error: 'Invalid query' })
                }

                const { model, where, data } = updateQuery;

                try {
                    const result = await prismaClient[model].update({
                        where,
                        data,
                    });
                    return res.status(200).json({ result });
                } catch (err) {
                    throw new Error(`Error querying the database: ${err.message}`);
                }
            }
            case 'delete': {
                const deleteQuery = parseDeleteQuery(query);

                if (!deleteQuery) {
                    return res.status(400).json({ error: 'Invalid query' });
                }

                const { model, where } = deleteQuery;

                try {
                    const result = await prismaClient[model].delete({
                        where,
                    });
                    return res.status(200).json({ result });
                } catch (err) {
                    throw new Error(`Error querying the database: ${err.message}`);
                }
            }
            default: {
                throw new Error('Invalid query operator');
            }
        }
    } catch (err) {
        logger.error(err.message);
        return res.status(400).json({ error: err.message });
    }
};

export const UserPermissionsController = async (req: Request, res: Response) => {
    const { page, pageSize } = req.query;

    try {
        const totalRowCount = await prismaClient.user.count();
        const users = await getUsers(parseInt(page as string), parseInt(pageSize as string));

        return res.status(200).json({ users, totalRowCount });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ error: err.message });
    }
};

export const DeleteUsersController = async (req: Request, res: Response) => {
    const { ids } = req.body;

    try {
        const deletedUsers = await deleteUsers(ids);

        return res.status(200).json({ deletedUsersCount: deletedUsers.length });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).send({ error: err.message });
    }
}

export const UserRoleUpdateController = async (req: Request, res: Response) => {
    const { roles } = req.body;

    try {
        const { success, errors } = await updateRoles(roles);

        return res.status(200).json({ success, errors });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ error: err.message });
    }
};

export const GetStatsController = async (_: Request, res: Response) => {
    try {
        const stats: Stats = {
            models: {},
            roles: {},
        };

        for (const model of prismaModels as PrismaModelName[]) {
            const count = await getCount(model);
            stats.models[model] = count;
        }

        for (const role of Object.keys(Role)) {
            const count = await getRoleCount(role as keyof typeof Role);
            stats.roles[role] = count;
        }

        return res.status(200).json({ stats });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ error: err.message });
    }
};
