import { College, Role, User } from '@prisma/client';
import { downloadFile } from 'apps/src/aws/s3';
import { getUser } from "apps/src/crud/auth.crud";
import { getTeamNamesFromInvites, updatePage } from "apps/src/crud/participantProfile.crud";
import { getColleges } from 'apps/src/crud/university.crud';
import { base64ToBuffer, bufferToBase64 } from 'apps/src/utils/bufferer';
import CustomError from 'apps/src/utils/error';
import { doesRoleHaveExactPermission, doesRoleHavePermission } from 'apps/src/utils/roles';
import { Request, Response } from "express";
import logger from "../../../middleware/logger";

/**
 * Controller for dealing with user sign in logic.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function getUserInfoController(req: Request, res: Response) {
    const { userId, email } = req.query as { userId: string; email: string; };

    let signedInUser: User | null;

    try {
        signedInUser = await getUser({
            email, dbFields: [
                'role',
                'college_id'
            ]
        });
    } catch {
        signedInUser = null;
    }

    try {
        const user = await getUser({
            id: userId as string,
            dbFields: [
                'first_name',
                'last_name',
                'display_name',
                'email',
                'team',
                'team_id',
                'college_id',
                'role',
                'college',
                'invites',
                'page',
            ]
        });

        let pendingTeams: string[] | undefined;

        if (user.invites.length > 0) {
            pendingTeams = await getTeamNamesFromInvites(user);
        }

        let userPicture: Buffer | null = null;

        if (user.page?.picture) {
            userPicture = await downloadFile(`${userId}/userPicture`);
        }

        if (userPicture && user.page) {
            user.page.picture = bufferToBase64(userPicture);
        }

        const colleges: College[] = await getColleges({ dbFields: ['id', 'name'] });

        let userCanEdit: boolean | undefined;

        if (signedInUser) {
            userCanEdit = (doesRoleHaveExactPermission(signedInUser.role, [
                Role.UNIVERSITY_MARKETING_MOD,
                Role.UNIVERSITY_TOURNAMENT_MOD
            ]) && signedInUser.college_id === user.college_id) ||
                doesRoleHavePermission(signedInUser.role, Role.AARDVARK_TOURNAMENT_MOD, false);
        }

        return res.status(200).json({
            user,
            pendingTeams,
            colleges,
            userCanEdit
        });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error retrieving user information',
        });
    }
}

/**
 * Controller for dealing with updating Participant Profile Information.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {*}  {Promise<void>}
 */
export async function updateInfoController(req: Request, res: Response) {
    const { userId, bio, pictureBase64, collegeName, displayName } = req.body;

    try {
        const user = await updatePage(
            userId,
            displayName || undefined,
            bio || undefined,
            collegeName,
            pictureBase64 ? base64ToBuffer(pictureBase64) : undefined,
        );

        return res.status(200).send({ user });
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ error: err instanceof CustomError ? err.message : 'Error updating profile information. Please try again.' })
    }
}
