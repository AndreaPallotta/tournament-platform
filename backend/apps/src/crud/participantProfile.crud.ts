import { College, Team, Tournament, User } from '@prisma/client';
import { uploadFile } from '../aws/s3';
import prismaClient from '../prisma/prisma.client';
import CustomError from '../utils/error';
import { getUser } from './auth.crud';
import { doesTeamExist } from './team.crud';

/**
 * Update User's Page info into database
 *
 * @param  {string} email
 * @param  {string} display_name
 * @param  {string} bio
 * @param  {string} picture
 *
 * @return {User}
 * @throws Exception
 */
export const updatePage = async (
    userId: string,
    displayName: string,
    userBio: string,
    collegeName: string,
    pictureBuffer?: Buffer,
): Promise<User> => {
    let userPictureLocation: string | null = null;

    const user = await getUser({ id: userId });

    if (user.team_id && user.college_id && collegeName) {
        throw new CustomError('You cannot switch colleges while in a team');
    }

    if (pictureBuffer) {
        userPictureLocation = await uploadFile(`${userId}/userPicture`, pictureBuffer);
    }

    let newCollege: College | null = null;

    if (collegeName) {
        newCollege = await prismaClient.college.findFirst({
            where: {
                name: collegeName
            }
        });
    }

    if (newCollege && user.college_id) {
        await prismaClient.user.update({
            where: {
                id: userId
            },
            data: {
                college: {
                    disconnect: true
                }
            }
        });
    }

    const updatedUser: User | undefined = (await prismaClient.user.update({
        where: { id: userId },
        data: {
            ...(displayName && { display_name: displayName }),
            ...((userPictureLocation || userBio) && {
                page: {
                    ...((userPictureLocation && { picture: userPictureLocation }) || { picture: user.page?.picture }),
                    ...((userBio && { bio: userBio }) || { bio: user.page?.bio })
                }
            }),
            ...(newCollege && {
                college: {
                    connect: {
                        name: newCollege.name
                    }
                }
            }),
        }
    })) as User;

    if (!updatedUser) {
        throw new CustomError('User not found');
    }

    return {
        ...updatedUser,
        password: '',
    };
};

export const getTeamNamesFromInvites = async (user: User) => {
    try {
        let teamNames = (await prismaClient.team.findMany({
            where: {
                id: {
                    // filter by teams that exist
                    in: await Promise.all(user.invites.filter((teamId) => {
                        if (!teamId) {
                            return false;
                        }

                        return doesTeamExist({ id: teamId });
                    }))
                }
            },
            select: {
                name: true
            }
            // only take team names
        })).map(team => team.name);

        return teamNames;
    } catch (err) {
        throw new Error('Error retrieving team invites');
    }
};
