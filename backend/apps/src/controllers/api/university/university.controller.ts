import { College, Role, Team, User } from "@prisma/client";
import { downloadFile, uploadFile } from "apps/src/aws/s3";
import { getUser } from "apps/src/crud/auth.crud";
import { createCollege, getCollege, getColleges } from "apps/src/crud/university.crud";
import logger from "apps/src/middleware/logger";
import prismaClient from "apps/src/prisma/prisma.client";
import { base64ToBuffer, bufferToBase64 } from "apps/src/utils/bufferer";
import CustomError from "apps/src/utils/error";
import { doesRoleHaveExactPermission, doesRoleHavePermission } from "apps/src/utils/roles";
import { Request, Response } from "express";

/**
 * Controller for creating a college.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function createCollegeController(req: Request, res: Response) {
    const { userId, collegeName, bio, pictureBase64 } = req.body;

    try {
        const user = await getUser({ id: userId, dbFields: ['id', 'role', 'college_id'] });

        if (user.college_id) {
            throw new Error('You are already managing a college');
        }

        const college = await createCollege(
            collegeName,
            bio,
            pictureBase64
        );

        const universityRole = doesRoleHaveExactPermission(user?.role, [
            Role.UNIVERSITY_MARKETING_MOD,
            Role.UNIVERSITY_TOURNAMENT_MOD
        ]);

        if (universityRole) {
            await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    college_id: college.id
                }
            });
        }

        return res.status(200).send({
            college
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if creating the college failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error creating college. Please try again.',
        });
    }
}

export async function getCollegeList(req: Request, res: Response) {
    try {
        const colleges: College[] = await getColleges({
            dbFields: ['id', 'name']
        });

        return res.status(200).send({
            colleges
        });
    }
    catch (err) {
        logger.error(err.message);
        // send back error response if getting college info failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Something went wrong when loading this page. Please try again.',
        });
    }

}

/**
 * Controller for getting college info.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function collegePage(req: Request, res: Response) {
    const { collegeName, email } = req.query as { collegeName: string; email: string; };

    let user: User | null;
    let userCanEdit: boolean | undefined;

    try {
        user = await getUser({
            email, dbFields: [
                'college_id',
                'role'
            ]
        });
    } catch {
        user = null;
    }

    const userCanCreateCollege = doesRoleHavePermission(
        user?.role,
        Role.UNIVERSITY_MARKETING_MOD,
        false
    );

    try {
        if (!collegeName) {
            let redirectCollege: College | null = null;

            if (user?.college_id) {
                redirectCollege = await getCollege({
                    id: user.college_id,
                    fail: false,
                    dbFields: ['name']
                });
            }

            return res.status(200).send({
                noCollegeName: {
                    userCanCreateCollege,
                    redirectCollege
                }
            });
        }

        const college = await getCollege({
            name: collegeName,
            dbFields: [
                'id',
                'name',
                'teams',
                'users',
                'page',
                'tournament',
                'tournament_id'
            ]
        }) as College & { teams: Team[] };

        if (user && user.college_id) {
            userCanEdit = (user.role === Role.UNIVERSITY_MARKETING_MOD || user.role === Role.UNIVERSITY_TOURNAMENT_MOD) && (user.college_id === college.id);
        } else if (doesRoleHavePermission(
            user?.role,
            Role.AARDVARK_TOURNAMENT_MOD,
            false
        )) {
            userCanEdit = true;
        }

        let collegePicture: Buffer | null = null;

        if (college.page?.picture) {
            collegePicture = await downloadFile(`${college.id}/collegePicture`);
        }

        if (collegePicture && college.page) {
            college.page.picture = bufferToBase64(collegePicture);
        }

        if (college?.teams) {
            for (const team of college.teams) {
                let teamPicture: Buffer | null = null;

                if (team && team.page?.picture) {
                    teamPicture = await downloadFile(`${team.id}/teamPicture`);
                }

                if (teamPicture && team.page) {
                    team.page.picture = bufferToBase64(teamPicture);
                }
            }
        }

        return res.status(200).send({
            college,
            userCanEdit
        });

    }
    catch (err) {
        logger.error(err.message);
        // send back error response if getting college info failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Something went wrong when loading this page. Please try again.',
        });
    }

}

/**
 * Controller for updating college information based on the edits made on the college page.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function edit(req: Request, res: Response) {
    const { collegeName, newCollegeName, pictureBase64, bio } = req.body;

    try {
        let collegePictureLocation: string | null = null;

        const college = await getCollege({ name: collegeName }) as College;

        if (pictureBase64) {
            collegePictureLocation = await uploadFile(`${college.id}/collegePicture`, base64ToBuffer(pictureBase64));
        }

        // dynamically attach each property since some fields from frontend might be undefined since they aren't touched
        const updatedCollege = await prismaClient.college.update({
            data: {
                ...(newCollegeName && { name: newCollegeName }),
                ...((collegePictureLocation || bio) && {
                    page: {
                        // store s3 bucket location of picture into college's 'picture' attribute in the database.
                        // make sure we're falling back on the college.page.picture/college.page.bio objects, otherwise these
                        // values will become empty in the database if they're undefined
                        ...((collegePictureLocation && { picture: collegePictureLocation }) || { picture: college.page?.picture }),
                        ...((bio && { bio: bio }) || { bio: college.page?.bio })
                    }
                })
            },
            where: {
                name: collegeName
            }
        });

        return res.status(200).send({
            // return updated version of college and location of picture uploaded
            college: updatedCollege,
            collegePictureLocation
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if editing the college page failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error updating college information. Please try again.'
        });
    }
}
