import { College, Prisma, Tournament } from "@prisma/client";
import { uploadFile } from "../aws/s3";
import prismaClient from "../prisma/prisma.client";
import { base64ToBuffer } from "../utils/bufferer";
import CustomError from "../utils/error";
import { arrayToPrismaFields } from "../utils/parser";
import { createSubTournament } from "./tournament.crud";

interface IGetCollegeParams {
    name?: string;
    id?: string;
    fail?: boolean;
    dbFields?: Prisma.CollegeSelect | string[];
    includeRelations?: Prisma.CollegeSelect | string[];
}

interface IGetCollegesParams {
    where?: Prisma.CollegeWhereInput;
    dbFields?: Prisma.CollegeSelect | string[];
    includeRelations?: Prisma.CollegeSelect | string[];
}

/**
 * Function to check whether a college exists in the database.
 *
 * @param  {string} name
 * @param  {string} id
 *
 * @returns {boolean}
 * @throws Exception
 */
export const doesCollegeExist = async ({
    name,
    id
}: { name?: string; id?: string }): Promise<boolean> => {
    if (!name && !id) throw new Error('College name and id are both empty');

    const count: number = await prismaClient.college.count({
        where: name ? { name } : { id },
    });

    return count > 0;
};

/**
 * Add a new college to the database.
 *
 * @param  {College} college
 * @return {College|undefined}
 *
 * @throws Exception
 */
export const createCollege = async (
    collegeName: string,
    bio?: string,
    pictureBase64?: string
): Promise<College> => {
    if (await doesCollegeExist({ name: collegeName })) {
        throw new CustomError('A college with that name already exists');
    }

    const college = await prismaClient.college.create({
        data: {
            name: collegeName
        },
    });

    let collegePictureLocation: string | null = null;

    if (pictureBase64) {
        collegePictureLocation = await uploadFile(`${college.id}/collegePicture`, base64ToBuffer(pictureBase64));
    }

    const mainTournament = await prismaClient.tournament.findFirst({
        where: {
            parent_id: null
        }
    });

    let childTournament: Tournament | null = null;

    const now = new Date();

    if (mainTournament && now < mainTournament.deadline) {
        childTournament = await createSubTournament({
            mainTournament: mainTournament,
            collegeName
        });
    }

    await prismaClient.college.update({
        where: {
            name: collegeName
        },
        data: {
            page: {
                picture: collegePictureLocation || '',
                bio: bio || ''
            },
            ...(childTournament && { tournament_id: childTournament.id })
        }
    });

    return college;
};

/**
 * Get college from database
 *
 * @param  {string} name
 * @param  {string[]|undefined} dbFields
 *
 * @return {College}
 * @throws Exception
 */
export const getCollege = async ({
    name,
    id,
    fail = true,
    dbFields,
    includeRelations
}: IGetCollegeParams): Promise<College | null> => {
    const select: Prisma.CollegeSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.CollegeInclude = arrayToPrismaFields(includeRelations);

    try {
        const college: College | null = await prismaClient.college.findFirst({
            where: name ? { name } : { id },
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });

        if (fail && !college) {
            throw new Error('College not found');
        }

        return college;
    } catch (err) {
        throw new Error('Error retrieving college');
    }
};

export const getColleges = async ({
    where,
    dbFields,
    includeRelations
}: IGetCollegesParams): Promise<College[]> => {
    const select: Prisma.CollegeSelect = arrayToPrismaFields(dbFields);
    const include: Prisma.CollegeInclude = arrayToPrismaFields(includeRelations);

    try {
        const colleges: College[] | undefined = await prismaClient.college.findMany({
            ...(where && { where }),
            ...(dbFields && { select }),
            ...(includeRelations && { include }),
        });

        return colleges || [];
    } catch (err) {
        throw new Error('Error retrieving colleges');
    }
};

export const searchColleges = async (searchTerm: string, dbFields?: string[]) => {
    const select: Prisma.CollegeSelect = arrayToPrismaFields(dbFields);
    try {
        return await prismaClient.college.findMany({
            ...searchTerm && ({
                where: {
                    name: {
                        contains: searchTerm.toLowerCase(),
                        mode: 'insensitive'
                    }
                }
            }),
            ...dbFields && ({ select })
        });
    } catch (err) {
        throw new CustomError('Error searching for college');
    }
}
