import { Page, Prisma, Role, User } from '@prisma/client';
import logger from '../middleware/logger';
import prismaClient from '../prisma/prisma.client';
import { compare, hash } from '../utils/hasher';
import { arrayToPrismaFields } from '../utils/parser';

interface IGetUserParams {
    email?: string;
    id?: string;
    password?: string;
    dbFields?: string[] | Prisma.UserSelect;
    includeRelations?: Prisma.UserSelect | string[];
}

interface IGetUsersParams {
    where?: Prisma.UserWhereInput;
    dbFields?: string[] | Prisma.UserSelect;
    includeRelations?: Prisma.UserSelect | string[];
}

/**
 * Function to check whether the user exists in the database
 * @param  {string} email
 *
 * @returns {boolean}
 * @throws Exception
 */
export const doesUserExist = async (email: string): Promise<boolean> => {
    if (!email) throw new Error('Email is empty');

    const count: number = await prismaClient.user.count({
        where: {
            email
        },
    });

    return count > 0;
};

export const validateUserInJWT = async (email: string, role: string) => {
    try {
        const user: User | null = await prismaClient.user.findFirst({
            where: {
                email,
                role: Role[role as keyof typeof Role]
            }
        });

        return user !== null && user.role === role;
    } catch (err) {
        logger.error(err.message);
        return false;
    }
};

/**
 * Get user from database
 *
 * @param  {string} email
 * @param  {string} password
 * @param  {string[]|undefined} dbFields
 *
 * @return {User}
 * @throws Exception
 */
export const getUser = async ({
    email,
    id,
    password,
    dbFields,
    includeRelations
}: IGetUserParams): Promise<User> => {
    const select: Prisma.UserSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.UserInclude = arrayToPrismaFields(includeRelations);

    try {
        const user: User | undefined = (await prismaClient.user.findFirst({
            where: email ? { email } : { id },
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        })) as User;

        if (!user) {
            throw new Error('User not found');
        }

        if (password) {
            const isHashValid = await compare(password, user.password);
            if (!isHashValid) {
                throw new Error();
            }
        }

        return user;
    } catch (err) {
        throw new Error('Error retrieving user')
    }
};

export const getUsers = async ({
    where,
    dbFields,
    includeRelations
}: IGetUsersParams): Promise<User[]> => {
    const select: Prisma.UserSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.UserInclude = arrayToPrismaFields(includeRelations);

    try {
        const users: User[] | undefined = await prismaClient.user.findMany({
            ...(where && { where }),
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });

        return users || [];
    } catch (err) {
        throw new Error('Error retrieving users')
    }
};

/**
 * Add a new user to the database if not present already
 *
 * @param  {User} user
 * @return {User|undefined}
 *
 * @throws Exception
 */
export const createUser = async (
    user:
        | {
            [key: string]: string;
        }
        | User
): Promise<User> => {
    const page: Page = {
        picture: '',
        bio: '',
    };

    try {
        if (await doesUserExist(user.email as string)) {
            throw new Error('User already exists');
        }
        const hashedPassword = await hash(user.password as string);
        return await prismaClient.user.create({
            data: { ...user, password: hashedPassword, page } as User,
        });
    } catch (err) {
        throw new Error(`Error creating user: ${err.message}`);
    }
};

export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const user = await prismaClient.user.delete({
            where: { id }
        });
        return !!user;
    } catch (err) {
        return false;
    }
}
