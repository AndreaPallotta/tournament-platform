import { College, Game, GameStatus, Role, Team, Tournament, TournamentStatus, User } from "@prisma/client";
import { downloadFile, uploadFile } from "apps/src/aws/s3";
import { getUser } from "apps/src/crud/auth.crud";
import { createRounds } from "apps/src/crud/bracket.crud";
import { createMainTournament, createSubTournament, getTournament } from "apps/src/crud/tournament.crud";
import { getColleges } from "apps/src/crud/university.crud";
import logger from "apps/src/middleware/logger";
import prismaClient from "apps/src/prisma/prisma.client";
import { base64ToBuffer, bufferToBase64 } from "apps/src/utils/bufferer";
import CustomError from "apps/src/utils/error";
import { doesRoleHavePermission } from "apps/src/utils/roles";
import { Request, Response } from "express";

export async function generateTournamentGames(req: Request, res: Response) {
    try {
        const mainTournament = await prismaClient.tournament.findFirst({
            where: {
                parent_id: null
            }
        });

        if (!mainTournament) {
            throw new CustomError('Cannot find the main tournament. It might have been deleted.');
        }

        await prismaClient.tournament.updateMany({
            data: {
                status: TournamentStatus.IN_PROGRESS,
                round: {
                    increment: 1
                }
            }
        });

        const colleges: College[] = (await prismaClient.college.findMany({
            where: {
                tournament_id: {
                    not: null
                },
            },
            include: {
                teams: true
            }
        })).filter(college => college.teams.length > 1);

        for (const college of colleges) {

            const teams: Team[] = await prismaClient.team.findMany({
                where: {
                    college_id: college.id
                }
            });

            await createRounds(college.tournament_id!, teams);
        }

        return res.status(200).send({
            tournament: mainTournament
        });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Something went wrong when creating bracketing info. Please try again.',
        });
    }
}

/**
 * Controller for creating a tournament.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function createTournamentController(req: Request, res: Response) {
    const { email, tournamentName, registerDeadline, startDate, endDate, bio, pictureBase64 } = req.body;

    try {
        const user = await getUser({ email, dbFields: ['id', 'role'] });

        const tournament = await createMainTournament(
            tournamentName,
            registerDeadline,
            startDate,
            endDate,
            bio,
            pictureBase64
        );

        const colleges: College[] = await getColleges({
            dbFields: ['id', 'name']
        });

        for (const { id, name } of colleges) {
            const childTournament = await createSubTournament({
                mainTournament: tournament,
                collegeName: name
            });

            if (childTournament) {
                await prismaClient.team.updateMany({
                    where: {
                        college_id: id
                    },
                    data: {
                        tournament_id: childTournament.id
                    }
                });

                await prismaClient.college.updateMany({
                    where: {
                        id,
                    },
                    data: {
                        tournament_id: childTournament.id
                    }
                });
            }
        };

        // if (compareRoleTo(user?.role, Role.AARDVARK_TOURNAMENT_MOD) === 0) {
        //     await prismaClient.user.update({
        //         where: {
        //             email
        //         },
        //         data: {
        //             college_id: college.id
        //         }
        //     });
        // }

        return res.status(200).send({
            tournament
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if creating the tournament failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error creating tournament. Please try again.',
        });
    }
}

/**
 * Controller for getting tournament info.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function tournamentPage(req: Request, res: Response) {
    const { tournamentName, email } = req.query as { tournamentName: string; email: string; };

    let user: User & { team: Team; college: College } | null;
    let userCanEdit: boolean | undefined;

    try {
        user = await getUser({
            email,
            includeRelations: ['team', 'college']
        }) as User & { team: Team; college: College };
    } catch {
        user = null;
    }

    const userCanCreateTournament = doesRoleHavePermission(
        user?.role,
        Role.AARDVARK_TOURNAMENT_MOD,
        false
    );

    const mainTournament = await prismaClient.tournament.findFirst({
        where: {
            parent_id: null
        }
    })

    try {
        if (!tournamentName) {
            let redirectTournament: Tournament | null = null;

            if (user?.college?.tournament_id) {
                redirectTournament = await getTournament({
                    id: user.college.tournament_id,
                    fail: false,
                    dbFields: ['name']
                });
            } else {
                redirectTournament = mainTournament;
            }

            return res.status(200).send({
                noTournamentName: {
                    userCanCreateTournament,
                    redirectTournament
                }
            });
        }

        const tournament = await getTournament({
            name: tournamentName,
            dbFields: [
                'id',
                'college',
                'parent_id',
                'name',
                'deadline',
                'start_date',
                'end_date',
                'teams',
                'status',
                'games',
                'page',
            ]
        }) as Tournament & { teams: Team[] };

        if (user && user.college) {
            userCanEdit = (user.role === Role.UNIVERSITY_TOURNAMENT_MOD) && (user.college?.tournament_id === tournament.id);
        } else if (doesRoleHavePermission(
            user?.role,
            Role.AARDVARK_TOURNAMENT_MOD,
            false
        )) {
            userCanEdit = true;
        }

        let tournamentPicture: Buffer | null = null;

        if (tournament.page?.picture) {
            tournamentPicture = await downloadFile(`${tournament.id}/tournamentPicture`);
        }

        if (tournamentPicture && tournament.page) {
            tournament.page.picture = bufferToBase64(tournamentPicture);
        }

        if (tournament?.teams) {
            for (const team of tournament.teams) {
                let teamPicture: Buffer | null = null;

                if (team && team.page?.picture) {
                    teamPicture = await downloadFile(`${team.id}/teamPicture`);
                }

                if (teamPicture && team.page) {
                    team.page.picture = bufferToBase64(teamPicture);
                }
            }
        }

        let mainTournamentName: string | undefined;

        if (tournament.parent_id !== null) {
            mainTournamentName = mainTournament?.name;
        } else {
            mainTournamentName = tournament.name;
        }

        return res.status(200).send({
            tournament,
            userCanEdit,
            mainTournamentName
        });

    }
    catch (err) {
        logger.error(err.message);
        // send back error response if getting tournament info failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Something went wrong when loading this page. Please try again.',
        });
    }

}

/**
 * Controller for updating tournament information based on the edits made on the tournament page.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function edit(req: Request, res: Response) {
    const { tournamentName, newTournamentName, registerDeadline, startDate, endDate, bio, pictureBase64 } = req.body;

    try {
        let tournamentPictureLocation: string | null = null;

        const tournament = await getTournament({ name: tournamentName }) as Tournament;

        if (pictureBase64) {
            tournamentPictureLocation = await uploadFile(`${tournament.id}/tournamentPicture`, base64ToBuffer(pictureBase64));
        }

        let updatedTournament: Tournament;
        let status: TournamentStatus;
        let updatedDates;

        const currentDate = new Date();

        if (tournament.start_date > currentDate) {
            status = 'UNSTARTED';
        } else if (tournament.start_date <= currentDate && tournament.end_date >= currentDate) {
            status = 'IN_PROGRESS';
        } else {
            status = 'TERMINATED';
        }

        if (status !== 'TERMINATED') {
            updatedDates = {
                ...(registerDeadline && { deadline: new Date(registerDeadline) }),
                ...(startDate && { start_date: new Date(startDate) }),
                ...(endDate && { end_date: new Date(endDate) })
            };

            await prismaClient.tournament.updateMany({
                where: {
                    parent_id: tournament.id
                },
                data: {
                    status,
                    ...updatedDates
                }
            });
        } else {
            const tournamentsToDelete: string[] = (await prismaClient.tournament.findMany({
                where: {
                    parent_id: tournament.id
                }
            })).map(tournament => tournament.id);

            await prismaClient.tournament.deleteMany({
                where: {
                    id: {
                        in: tournamentsToDelete
                    }
                }
            });

            const disconnectTournaments = {
                where: {
                    tournament_id: {
                        in: tournamentsToDelete
                    }
                },
                data: {
                    tournament_id: null
                }
            };

            await prismaClient.team.updateMany(disconnectTournaments);
            await prismaClient.college.updateMany(disconnectTournaments);
            await prismaClient.game.updateMany(disconnectTournaments);
        }

        // dynamically attach each property since some fields from frontend might be undefined since they aren't touched
        updatedTournament = await prismaClient.tournament.update({
            data: {
                ...(newTournamentName && { name: newTournamentName }),
                ...((tournamentPictureLocation || bio) && {
                    page: {
                        // store s3 bucket location of picture into tournament's 'picture' attribute in the database.
                        // make sure we're falling back on the tournament.page.picture/tournament.page.bio objects, otherwise these
                        // values will become empty in the database if they're undefined
                        ...((tournamentPictureLocation && { picture: tournamentPictureLocation }) || { picture: tournament.page?.picture }),
                        ...((bio && { bio: bio }) || { bio: tournament.page?.bio })
                    }
                }),
                status,
                ...(updatedDates && updatedDates)
            },
            where: {
                name: tournamentName
            }
        });

        return res.status(200).send({
            // return updated version of tournament and location of picture uploaded
            tournament: updatedTournament,
            tournamentPictureLocation
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if editing the tournament page failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error updating tournament information. Please try again.'
        });
    }
}
