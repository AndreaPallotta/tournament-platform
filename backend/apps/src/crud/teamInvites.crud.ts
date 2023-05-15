import { College, Team, User } from '@prisma/client';
import prismaClient from '../prisma/prisma.client';
import CustomError from '../utils/error';
import { getUser } from './auth.crud';
import { getTeam } from './team.crud';

/**
 * Get invites for a User from database
 *
 * @param  {string} email
 * @param  {string[]|undefined} dbFields
 *
 * @return {User}
 * @throws Exception
 */
export const getTeamInvites = async (
    userId: string,
): Promise<string[]> => {

    try {
        const user: User | undefined = (await prismaClient.user.findFirst({
            where: { id: userId },
            select: {
                invites: true
            }
        })) as User;


        if (!user) {
            throw new Error('Invites for User not found');
        }

        return user.invites;
    } catch (err) {
        throw new Error('Error retrieving team invites');
    }
};

//Are they on a team
export const hasTeam = async (
    userId: string,
): Promise<Boolean> => {

    try {
        const user = await getUser({ id: userId, dbFields: ['team_id'] })
        const team = user.team_id
        return team ? true : false
    } catch (err) {
        return false;
    }

}


/**
 * Accept invite for a User
 *
 * @param  {string} userId
 * @param  {string} teamName
 * @param  {string[]|undefined} dbFields
 *
 * @return {User}
 * @throws Exception
 */
export const acceptTeamInvite = async (
    userId: string,
    teamName: string
): Promise<User> => {

    const invites = await getTeamInvites(userId);
    const team = await getTeam({ name: teamName, includeRelations: ['players', 'college', 'tournament'] }) as Team & { players: User[]; college: College; };
    const user = await getUser({ id: userId, dbFields: ['college_id'] });

    if (await hasTeam(userId)) {
        throw new CustomError('You are already on a team');
    }

    if (user.college_id !== team.college_id) {
        throw new CustomError(`You must be a member of ${team.college?.name || `the same college`} to join this team`);
    }

    if (!invites) {
        throw new Error('Invites for User not found');
    }

    if (!invites.includes(team.id)) {
        throw new CustomError('You are not invited to this team');
    }

    if (team.players.length >= 5) {
        throw new CustomError('There is already 5 players on this team');
    }

    const now = new Date();

    if (team.tournament_id) {
        const teamTournament = await prismaClient.tournament.findFirst({
            where: {
                id: team.tournament_id
            }
        });

        if (teamTournament && now >= teamTournament.deadline) {
            throw new CustomError('You cannot join this team because their tournament is ongoing');
        }
    }

    // remove invites from team since user is joining said team, and also connect the team
    const updatedUser = await prismaClient.user.update({
        where: { id: userId },
        data: {
            invites: {
                set: invites.filter(teamId => teamId !== team.id)
            },
            team: {
                connect: {
                    name: teamName
                }
            }
        },
        include: {
            team: true
        }
    });

    return {
        ...updatedUser,
        password: undefined,
    } as unknown as User;
};

// /**
//  * Add Player to Team field players
//  *
//  * @param  {string} teamID
//  * @param  {string} email
//  * @param  {string[]|undefined} dbFields
//  *
//  * @return {Team}
//  * @throws Exception
//  */
// export const addPlayerToTeamList = async (
//     teamID: string,
//     email: string
// ): Promise<Team> => {

//     const userID = (await getUser(email, undefined, ['id'])).id;

//     const addPlayer: Team | undefined = (await prismaClient.team.update({
//       where: {id: teamID},
//         data: {
//             players: {
//                 connect: {
//                         id: userID
//                     }
//             }
//         }
//     })) as Team;

//     return addPlayer;
// };

/**
 * Remove Player to Team field players
 *
 * @param  {string} userId
 * @param  {string[]|undefined} dbFields
 *
 * @return {User}
 * @throws Exception
 */
export const removePlayerFromTeamList = async (
    userId: string
): Promise<User> => {
    const removePlayer = await prismaClient.user.update({
        where: { id: userId },
        data: {
            team: {
                disconnect: true
            }
        }
    }) as User;

    return {
        ...removePlayer,
        password: '',
    };
};

/**
 * Delete invite for a User
 *
 * @param  {string} userId
 * @param  {string} teamName
 * @param  {string[]|undefined} dbFields
 *
 * @return {User}
 * @throws Exception
 */
export const rejectTeamInvite = async (
    userId: string,
    teamName: string
): Promise<User> => {
    const invites = await getTeamInvites(userId);
    const team = await getTeam({ name: teamName, dbFields: ['id'] });

    if (!invites || invites.length == 0) {
        throw new Error('Invites for User not found');
    }

    if (!invites.includes(team.id)) {
        throw new CustomError('You are not invited to this team');
    }

    // remove invite
    const updatedUser = await prismaClient.user.update({
        where: { id: userId },
        data: {
            invites: {
                set: invites.filter(teamId => teamId !== team.id)
            }
        },
        include: {
            team: true
        }
    });

    return {
        ...updatedUser,
        password: undefined,
    } as unknown as User;
};

/**
 * Leave Team for a User
 *
 * @param  {string} userId
 * @param {string} teamName
 * @param  {string[]|undefined} dbFields
 *
 * @return {User}
 * @throws Exception
 */
export const leaveTeam = async (
    userId: string,
    teamName: string
): Promise<User> => {
    const playerTeam = (await prismaClient.team.count({
        where: {
            name: teamName,
            players: {
                some: {
                    id: userId
                }
            }
        }
    })) > 0;

    if (!playerTeam) {
        throw new CustomError('You are not part of this team')
    }

    const leave = await removePlayerFromTeamList(userId)

    return leave;
};
