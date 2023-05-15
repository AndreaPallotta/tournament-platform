import { Team } from '@prisma/client';
import prismaClient from '../prisma/prisma.client';
import CustomError from '../utils/error';
import { getUser } from './auth.crud';

interface IUpvoteParams {
    userId: string;
    upvote: boolean;
    teamName?: string;
    id?: string;
}

/**
 * Update upvote count
 *
 * @param  {string} userId
 * @param  {string} teamName
 *
 * @return {Team}
 * @throws Exception
 */
export const upvoteTeam = async ({
    userId,
    upvote,
    teamName,
    id
}: IUpvoteParams): Promise<Team> => {
    const teamCount = await prismaClient.team.count({ where: teamName ? { name: teamName } : { id } });

    if (teamCount <= 0) {
        throw new Error('Team not found');
    }

    const team: Team | undefined = (await prismaClient.team.update({
        where: teamName ? { name: teamName } : { id },
        data: {
            upvotes: {
                ...(upvote ? { increment: 1 } : { decrement: 1 })
            }
        }
    })) as Team;

    const user = await getUser({
        id: userId,
        dbFields: ['upvoted_teams']
    });

    let newUpvotedTeamArray;

    if (!upvote) {
        newUpvotedTeamArray = user.upvoted_teams.filter(teamId => teamId !== team.id);
    }

    await prismaClient.user.update({
        where: {
            id: userId
        },
        data: {
            upvoted_teams: {
                ...(upvote ? { push: team.id } : { set: newUpvotedTeamArray })
            }
        }
    });

    return team;
};