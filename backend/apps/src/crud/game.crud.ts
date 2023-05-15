import { Game, Prisma, Team } from "@prisma/client";
import prismaClient from "../prisma/prisma.client";
import { arrayToPrismaFields } from "../utils/parser";
import { getCollege } from "./university.crud";

interface IGetGameTeamsParams {
    tournamentId?: string;
    collegeId?: string;
    dbFields?: Prisma.GameSelect | string[];
    includeRelations?: Prisma.GameSelect | string[];
}

interface IGetGameParams {
    gameId?: string;
    dbFields?: Prisma.GameSelect | string[];
    includeRelations?: Prisma.GameSelect | string[];
}

/**
 * Gets games, and teams associated with those games.
 *
 * @param  {string | undefined} tournamentId
 * @param  {string | undefined} collegeId
 * @param  {Prisma.GameSelect | string[] |undefined} dbFields
 * @param  {Prisma.GameSelect | string[] | undefined} includeRelations
 *
 * @returns {Promise<{ games: Game[] | undefined, teams: Team[] | undefined }>}
 */
export const getGameTeams = async ({
    tournamentId,
    collegeId,
    dbFields,
    includeRelations
}: IGetGameTeamsParams): Promise<{ games: Game[] | undefined, teams: Team[] | undefined }> => {
    const select: Prisma.GameSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.GameSelect = arrayToPrismaFields(includeRelations);

    let games: Game[] | undefined;
    let teams: Team[] | undefined;

    if (tournamentId) {
        teams = await prismaClient.team.findMany({
            where: {
                tournament_id: tournamentId
            },
            include: {
                players: true
            }
        });

        games = await prismaClient.game.findMany({
            where: {
                tournament_id: tournamentId
            },
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });
    } else if (collegeId) {
        const college = await getCollege({
            id: collegeId,
            dbFields: ['tournament_id']
        });

        teams = await prismaClient.team.findMany({
            where: {
                college_id: collegeId
            },
            include: {
                players: true
            }
        });

        games = await prismaClient.game.findMany({
            where: {
                tournament_id: college?.tournament_id
            },
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });
    }

    return {
        games,
        teams
    };
};

/**
 * Gets a game from the database.
 *
 * @param  {string | undefined} tournamentId
 * @param  {string | undefined} collegeId
 * @param  {Prisma.GameSelect | string[] |undefined} dbFields
 * @param  {Prisma.GameSelect | string[] | undefined} includeRelations
 *
 * @returns {Promise<Game>}
 */
export const getGame = async ({
    gameId,
    dbFields,
    includeRelations
}: IGetGameParams): Promise<Game> => {
    const select: Prisma.GameSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.GameSelect = arrayToPrismaFields(includeRelations);

    const game: Game | null = await prismaClient.game.findFirst({
        where: {
            id: gameId
        },
        ...(dbFields && { select }),
        ...(includeRelations && { include }),
    });

    if (!game) {
        throw new Error('Game not found');
    }

    return game;
};