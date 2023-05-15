import { Prisma, Tournament } from "@prisma/client";
import { uploadFile } from "../aws/s3";
import prismaClient from "../prisma/prisma.client";
import { base64ToBuffer } from "../utils/bufferer";
import CustomError from "../utils/error";
import { arrayToPrismaFields } from "../utils/parser";

interface IGetTournamentParams {
    name?: string;
    id?: string;
    fail?: boolean;
    dbFields?: Prisma.TournamentSelect | string[];
    includeRelations?: Prisma.TournamentSelect | string[];
}

/**
 * Function to check whether a tournament exists in the database.
 *
 * @param  {string} name
 * @param  {string} id
 *
 * @returns {boolean}
 * @throws Exception
 */
export const doesTournamentExist = async ({
    name,
    id
}: { name?: string; id?: string }): Promise<boolean> => {
    if (!name && !id) throw new Error('Tournament name and id are both empty');

    try {
        const count: number = await prismaClient.tournament.count({
            where: name ? { name } : { id },
        });

        return count > 0;
    } catch (err) {
        throw new Error('Error checking if tournament exists');
    }
};

/**
 * Add a new tournament to the database.
 *
 * @param  {Tournament} tournament
 * @return {Tournament|undefined}
 *
 * @throws Exception
 */
export const createMainTournament = async (
    tournamentName: string,
    registerDeadline: string,
    startDate: string,
    endDate: string,
    bio?: string,
    pictureBase64?: string
): Promise<Tournament> => {
    if (await doesTournamentExist({ name: tournamentName })) {
        throw new CustomError('A tournament with that name already exists');
    }

    const tournamentInProgress = await prismaClient.tournament.count({
        where: {
            parent_id: null
        }
    });

    if (tournamentInProgress >= 1) {
        throw new CustomError('There is already a main tournament in progress at this time');
    }

    const tournament = await prismaClient.tournament.create({
        data: {
            name: tournamentName,
            deadline: new Date(registerDeadline),
            start_date: new Date(startDate),
            end_date: new Date(endDate),
            parent_id: null
        },
    });

    let tournamentPictureLocation: string | null = null;

    if (pictureBase64) {
        tournamentPictureLocation = await uploadFile(`${tournament.id}/tournamentPicture`, base64ToBuffer(pictureBase64));
    }

    await prismaClient.tournament.update({
        where: {
            name: tournamentName
        },
        data: {
            page: {
                picture: tournamentPictureLocation || '',
                bio: bio || ''
            }
        }
    });

    return tournament;
};

export const createSubTournament = async ({
    mainTournament,
    collegeName
}: { mainTournament: Tournament; collegeName: string }) => {
    return await prismaClient.tournament.create({
        data: {
            name: `${mainTournament.name} (${collegeName})`,
            deadline: mainTournament.deadline,
            start_date: mainTournament.start_date,
            end_date: mainTournament.end_date,
            status: 'UNSTARTED',
            page: {
                bio: `${collegeName}'s description.`,
                picture: '',
            },
            parent_id: mainTournament.id
        }
    })
};

/**
 * Get tournament from database
 *
 * @param  {string} name
 * @param  {string[]|undefined} dbFields
 *
 * @return {Tournament}
 * @throws Exception
 */
export const getTournament = async ({
    name,
    id,
    fail = true,
    dbFields,
    includeRelations
}: IGetTournamentParams): Promise<Tournament | null> => {
    const select: Prisma.TournamentSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.TournamentSelect = arrayToPrismaFields(includeRelations);

    try {
        let tournament: Tournament | null = null;

        tournament = await prismaClient.tournament.findFirst({
            where: name ? { name } : { id },
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });

        if (fail && !tournament) {
            throw new Error('Tournament not found');
        }

        return tournament;
    } catch (err) {
        throw new Error('Error retrieving tournament');
    }
};
