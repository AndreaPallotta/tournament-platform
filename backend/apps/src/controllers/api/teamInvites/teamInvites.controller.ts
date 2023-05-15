import { Role } from '@prisma/client';
import { generateAuthToken } from 'apps/src/auth/jwt';
import { getTeamNamesFromInvites } from 'apps/src/crud/participantProfile.crud';
import { acceptTeamInvite, leaveTeam, rejectTeamInvite } from 'apps/src/crud/teamInvites.crud';
import prismaClient from 'apps/src/prisma/prisma.client';
import CustomError from 'apps/src/utils/error';
import { compareRoleTo, doesRoleHaveExactPermission } from 'apps/src/utils/roles';
import { Request, Response } from 'express';
import logger from '../../../middleware/logger';

/**
 * Controller for dealing with acccepting an Invite
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function acceptInviteController(req: Request, res: Response) {
    const { userId, teamName } = req.body;

    try {
        const user = await acceptTeamInvite(userId, teamName);

        let authToken: string | null = null;

        if (compareRoleTo(user?.role, 'REGISTERED_USER') === 0) {
            authToken = generateAuthToken(user.email, user.role);

            await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    role: 'PLAYER'
                }
            });
        }

        return res.status(200).json({
            user,
            authToken
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if there is no user with the email supplied
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : `Error accepting invite`,
        });
    }
}

/**
 * Controller for dealing with rejecting an Invite
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function rejectInviteController(req: Request, res: Response) {
    const { userId, teamName } = req.body;

    try {
        const user = await rejectTeamInvite(userId, teamName);

        return res.status(200).json({
            user
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if there is no user with the email supplied
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error rejecting invite',
        });
    }
}

/**
 * Controller for dealing with leaving a team
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function leaveTeamController(req: Request, res: Response) {
    const { userId, teamName } = req.body;

    try {
        const user = await leaveTeam(userId, teamName);

        let authToken: string | null = null;

        if (doesRoleHaveExactPermission(
            user?.role,
            [Role.TEAM_CAPTAIN, Role.PLAYER],
        )) {
            authToken = generateAuthToken(user.email, user.role);

            await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    role: 'REGISTERED_USER'
                }
            });
        }

        return res.status(200).json({
            user,
            pendingTeams: await getTeamNamesFromInvites(user),
            authToken
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if there is no user with the email supplied
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error leaving team',
        });
    }
}