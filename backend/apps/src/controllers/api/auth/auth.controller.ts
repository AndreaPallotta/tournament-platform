import { Role } from '@prisma/client';
import {
    generateAuthToken,
    generateRefreshToken,
    validateRefreshToken
} from 'apps/src/auth/jwt';
import { createUser, deleteUser, getUser } from 'apps/src/crud/auth.crud';
import { deleteTeam, removePlayer } from 'apps/src/crud/team.crud';
import prismaClient from 'apps/src/prisma/prisma.client';
import { ProtectedRequest } from 'apps/src/types/req.types';
import CustomError from 'apps/src/utils/error';
import { hash } from 'apps/src/utils/hasher';
import { Request, Response } from 'express';
import logger from '../../../middleware/logger';

/**
 * Controller for dealing with user signup logic.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function signUpController(req: any, res: any) {
    const { first_name, last_name, display_name, email, password } = req.body;

    try {
        // create new user
        const user = await createUser({
            first_name,
            last_name,
            display_name,
            email,
            password,
        });

        if (!user) {
            logger.error('User not found');
            return res.status(404).json({
                error: 'There was some trouble creating your account. Please try again.',
            });
        }

        const authToken = generateAuthToken(user.email, user.role);
        const refreshToken = generateRefreshToken(user.email, user.role);

        if (!authToken || !refreshToken) {
            logger.error(`Auth or refresh token not generated correctly: ${{ authToken, refreshToken }}`);
            return res.status(500).json({
                error: 'There was an error generating tokens. Try to login.',
            });
        }

        return res.status(200).json({
            user: {
                ...user,
                password: undefined,
            },
            authToken,
            refreshToken,
        });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'There was some trouble creating your account. Please try again.',
        });
    }
}

/**
 * Controller for dealing with user sign in logic.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function signInController(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
        const user = await getUser({
            email, password, dbFields: [
                'id',
                'first_name',
                'last_name',
                'email',
                'password',
                'role',
                'team',
                'team_id',
                'page',
                'upvoted_teams',
                'invites'
            ]
        });

        const authToken = generateAuthToken(email, user.role);
        const refreshToken = generateRefreshToken(email, user.role);

        if (!authToken || !refreshToken) {
            logger.error(`Auth or refresh token not generated correctly: ${{ authToken, refreshToken }}`);
            return res.status(500).json({
                error: 'There was an error generating tokens. Try to login.',
            });
        }

        return res.status(200).json({
            user: {
                ...user,
                password: undefined,
            },
            authToken,
            refreshToken,
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if there is no user with the email supplied
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Your email or password is wrong. Please try again.',
        });
    }
}

/**
 * Controller for dealing with forgot password logic when the user requests to reset it.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function forgotPasswordController(req: Request, res: Response) {
    const { email } = req.body;

    try {
        const user = await getUser({ email });

        return res.status(200).json('Dummy response.');
    } catch (err) {
        // send back error response if there is no user with the email supplied
        return res.status(404).json({
            error: err instanceof CustomError ? err.message : 'There was some trouble resetting your password. Please try again.',
        });
    }
}

/**
 * Controller for dealing with password reset logic. This will attempt to reset the user's password.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function passwordResetController(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
        const user = await getUser({ email });

        if (!user) {
            logger.error('User not found');
            return res.status(404).json({
                error: 'Cannot find a user with that email. Please try again.',
            });
        }

        const hashedPassword = await hash(password);

        // update the user's password with their new hashed password
        await prismaClient.user.update({
            where: {
                id: user.id,
                email: user.email,
            },
            data: {
                password: hashedPassword,
            }
        });

        return res.status(200).json({
            ...user,
            password: undefined,
        });
    } catch (err) {
        logger.error(err.message);
        return res
            .status(400)
            .json({ error: err instanceof CustomError ? err.message : `Error resetting your password` });
    }
}

/**
 * Controller for creating a new Auth JWT from the refresh token
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function refreshTokenController(req: Request, res: Response) {
    const { token } = req.body;

    try {
        const decoded = validateRefreshToken(token);

        if (!decoded) {
            return res
                .status(401)
                .json({ error: 'Cannot validate refresh token.' });
        }
        const auth_token = generateAuthToken(decoded.email, decoded.role);
        return res.status(200).json({ auth_token });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ error: err instanceof CustomError ? err.message : 'Cannot generate a new token.' });
    }
}

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function validateDynRouteController(req: Request, res: Response) {
    const { fieldName, fieldValue, model } = req.query;

    try {
        const count = await prismaClient[model as string].count({
            where: {
                [fieldName as string]: fieldValue as string
            }
        });

        if (count > 0) {
            return res.status(200).json({
                found: true,
            });
        }

        return res.status(404).json({
            error: `${model} ${fieldValue} not found`
        })
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : `Error retrieving ${model} ${fieldValue} not found`
        });
    }
}

export async function deleteAccountController(req: ProtectedRequest, res: Response) {
    const { userId, teamId } = req.body;

    const role = req.role;

    try {
        if (teamId) {
            if (role === Role.TEAM_CAPTAIN) {
                const isDeleted = await deleteTeam(teamId);
                if (!isDeleted) {
                    return res.status(500).json({ err: 'Error deleting account: failed to delete team' });
                }
            } else if (role === Role.PLAYER) {
                const isRemoved = await removePlayer(teamId, userId);
                if (!isRemoved) {
                    return res.status(500).json({ err: 'Error deleting account: failed to remove user from team' });
                }
            }
        }

        const deleted = await deleteUser(userId);
        if (!deleted) {
            return res.status(500).send({ err: 'Error deleting account' });
        }

        return res.status(200).send({ deleted: true });
    } catch (err) {
        return res.status(500).send({ err: 'Error deleting account' });
    }


}
