import { College, Prisma, Role, Team, Tournament, User } from '@prisma/client';
import { uploadFile } from '../aws/s3';
import logger from '../middleware/logger';
import prismaClient from '../prisma/prisma.client';
import { base64ToBuffer } from '../utils/bufferer';
import CustomError from '../utils/error';
import { arrayToPrismaFields } from '../utils/parser';
import { getCollege } from './university.crud';

interface IGetTeamParams {
    name?: string;
    id?: string;
    dbFields?: Prisma.TeamSelect | string[];
    includeRelations?: Prisma.TeamSelect | string[];
}

interface IGetTeamsParams {
    where?: Prisma.TeamWhereInput;
    dbFields?: Prisma.TeamSelect | string[];
    includeRelations?: Prisma.TeamSelect | string[];
}

/**
 * Function to check whether a team exists in the database
 * @param  {string} name
 * @param  {string} id
 *
 * @returns {boolean}
 * @throws Exception
 */
export const doesTeamExist = async ({
    name,
    id
}: { name?: string; id?: string }): Promise<boolean> => {
    if (!name && !id) throw new Error('Team name and id are both empty');

    const count: number = await prismaClient.team.count({
        where: name ? { name } : { id },
    });

    return count > 0;
};

export const getTeams = async ({
    where,
    dbFields,
    includeRelations
}: IGetTeamsParams): Promise<Team[] | []> => {
    const select: Prisma.TeamSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.TeamInclude = arrayToPrismaFields(includeRelations);

    try {
        const teams: Team[] | undefined = await prismaClient.team.findMany({
            ...(where && { where }),
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });

        return teams || [];
    } catch (err) {
        throw new Error('Error retrieving teams')
    }
};

/**
 * Get teams from database
 *
 * @param  {string} name
 * @param  {string[]|undefined} dbFields
 *
 * @return {Team}
 * @throws Exception
 */
export const getTeam = async ({
    name,
    id,
    dbFields,
    includeRelations
}: IGetTeamParams): Promise<Team> => {
    const select: Prisma.TeamSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.TeamInclude = arrayToPrismaFields(includeRelations);

    try {
        const team: Team | undefined = (await prismaClient.team.findFirst({
            where: name ? { name } : { id },
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        })) as Team;

        if (!team) {
            throw new Error('Team not found');
        }

        return team;
    } catch (err) {
        throw new Error('Error retrieving team')
    }
};

/**
 * Add a new team to the database if not present already
 *
 * @param  {Team} team
 * @return {Team|undefined}
 *
 * @throws Exception
 */
export const createTeam = async (
    teamName: string,
    collegeName: string,
    pictureBase64?: string,
    bio?: string
): Promise<Team> => {
    const college = await getCollege({
        name: collegeName,
        includeRelations: ['tournament']
    }) as College & { tournament: Tournament };

    if (await doesTeamExist({ name: teamName })) {
        throw new CustomError('A team with that name already exists');
    }

    const now = new Date();

    const team = await prismaClient.team.create({
        data: {
            name: teamName,
            college_id: college.id,
            ...((college.tournament && now < college.tournament.deadline) && { tournament_id: college.tournament_id })
        },
    });

    let teamPictureLocation: string | null = null;

    if (pictureBase64) {
        teamPictureLocation = await uploadFile(`${team.id}/teamPicture`, base64ToBuffer(pictureBase64));
    }

    await prismaClient.team.update({
        where: {
            name: teamName
        },
        data: {
            page: {
                picture: teamPictureLocation || '',
                bio: bio || ''
            }
        }
    });

    return team;
};

export const removePlayer = async (teamId: string, userId: string) => {
    try {
        const result = await prismaClient.team.update({
            where: { id: teamId },
            data: {
                players: {
                    disconnect: { id: userId }
                }
            }
        })

        return !!result;
    } catch (err) {
        logger.error(`Error removing player from team: ${err}`);
        return false;
    }
};

export const deleteTeam = async (id: string) => {
    try {
        await prismaClient.user.updateMany({
            where: { team_id: id },
            data: {
                role: Role.REGISTERED_USER,
                team_id: null,
            },
        });

        const invitedUsers = await prismaClient.user.findMany({
            where: {
                invites: { has: id },
            }
        });

        for (const user of invitedUsers) {
            await prismaClient.user.update({
                where: { id: user.id },
                data: {
                    invites: {
                        set: user.invites.filter((inviteId: string) => inviteId !== id),
                    }
                }
            });
        }

        await prismaClient.team.delete({
            where: { id }
        });

        return true;
    } catch (err) {
        logger.error(`Error deleting team: ${err}`);
        return false;
    }
};
