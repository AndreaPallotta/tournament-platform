import { College, Role, Team, Tournament, User } from '@prisma/client';
import { generateAuthToken } from 'apps/src/auth/jwt';
import { downloadFile, uploadFile } from 'apps/src/aws/s3';
import { getUser, getUsers } from 'apps/src/crud/auth.crud';
import { createTeam, getTeam } from 'apps/src/crud/team.crud';
import prismaClient from 'apps/src/prisma/prisma.client';
import { base64ToBuffer, bufferToBase64 } from 'apps/src/utils/bufferer';
import CustomError from 'apps/src/utils/error';
import { compareRoleTo, doesRoleHaveExactPermission, doesRoleHavePermission } from 'apps/src/utils/roles';
import { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';
import logger from '../../../middleware/logger';

// structure of the get response for the team page info
interface IQueryParams {
    teamName: string;
    email: string;
}

/**
 * Controller for fetching information about a team page (the team itself, and whether or not the current
 * user is the team captain of said team).
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function teamPage(req: Request, res: Response) {
    const { teamName, email } = req.query as unknown as IQueryParams;

    let user: User | null;

    try {
        user = await getUser({
            email, dbFields: [
                'team_id',
                'role',
                'upvoted_teams',
                'college_id'
            ]
        });
    } catch {
        user = null;
    }

    try {
        const team = await getTeam({ name: teamName, dbFields: ['id', 'name', 'review_status', 'college', 'college_id', 'page', 'players', 'upvotes', 'tournament'] }) as Team & { players: User[]; };
        // check if user currently signed in is a team captain, and that they own the current team being visited
        const userCanEdit = user !== null &&
            (
                (user.role === Role.TEAM_CAPTAIN && user.team_id === team.id) ||
                (doesRoleHaveExactPermission(user.role, [
                    Role.UNIVERSITY_MARKETING_MOD, Role.UNIVERSITY_TOURNAMENT_MOD
                ]) &&
                    user.college_id === team.college_id) ||
                doesRoleHavePermission(user.role, Role.AARDVARK_TOURNAMENT_MOD, false)
            );

        const userUpvotedTeam = user !== null && user.upvoted_teams.includes(team.id);

        let teamPicture: Buffer | null = null;

        if (team.page?.picture) {
            teamPicture = await downloadFile(`${team.id}/teamPicture`);
        }

        if (teamPicture && team.page) {
            team.page.picture = bufferToBase64(teamPicture);
        }

        for (const player of team.players) {
            let userPicture: Buffer | null = null;

            if (player && player.page?.picture) {
                userPicture = await downloadFile(`${player.id}/userPicture`);
            }

            if (userPicture && player.page) {
                player.page.picture = bufferToBase64(userPicture);
            }
        }

        const teamCaptain = team.players?.find(player => player.role === Role.TEAM_CAPTAIN);

        const invitees: User[] = await getUsers({
            where: {
                college_id: team.college_id,
                role: {
                    in: [Role.REGISTERED_USER, Role.PLAYER, Role.TEAM_CAPTAIN]
                },
                id: {
                    not: teamCaptain?.id
                }
            },
            dbFields: ['id', 'email']
        });

        return res.status(200).json({
            team: team,
            userCanEdit,
            userUpvotedTeam,
            invitees
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if getting team info failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Something went wrong when loading this page. Please try again.',
        });
    }
}

/**
 * Controller for inviting a player to a team. This will send an email with a link they can click to join the team.
 * It will also add to their list of 'invites'.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function invitePlayers(req: Request, res: Response) {
    const { teamName, email } = req.body;

    try {
        const team = await getTeam({ name: teamName, includeRelations: ['players'] }) as Team & { players: User[]; };
        const user: User = await getUser({ email, dbFields: ['email', 'display_name'] });

        if (team.players.length >= 5) {
            throw new CustomError('There is already 5 players on this team');
        }

        await prismaClient.user.update({
            where: { email },
            data: {
                invites: {
                    push: team.id
                }
            }
        });

        // TODO: get rid of this later, as it's just temporary for testing the looks of our emails quickly
        const fakeEmailAccount = await nodemailer.createTestAccount();

        /*
            Creates reusable transporter object using the default SMTP transport.

            TODO:
            Our real config would probably look something like this:
                const transportConfig = {
                    service: 'gmail',
                    host: 'smtp.ethereal.email',
                    secure: false,
                    auth: {
                        user: EMAIL, (email of aardvark from env file)
                        pass: PASSWORD (password of aardvark email from env file. we'd probably have to generate a "google application" password for our company's official gmail account)
                    }
                }
        */
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: fakeEmailAccount.user, // generated ethereal user
                pass: fakeEmailAccount.pass, // generated ethereal password
            }
        });

        // send mail with defined transport object
        // TODO: update the look and text in our emails. possibly use an HTML builder?
        const emailInfo = await transporter.sendMail({
            from: '"Aardvark Games" <aardvarkgames@example.com>', // sender address
            to: user.email, // receiver
            subject: `${teamName} Has Invited You to Join Their Team!`, // Subject line
            text: 'HELLO WORLD', // plain text body
            html: `Hello ${user.display_name ?? 'player'}, ${teamName} invited you to join their team!`, // html body (no html for now)
        });

        // close connection to email server
        transporter.close();

        return res.status(200).json({
            // open any of these email links in a browser to preview the emails
            emailPreview: nodemailer.getTestMessageUrl(emailInfo)
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if inviting a player by email failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error inviting player. Please try again.',
        });
    }
}

/**
 * Controller for updating team information based on the edits made on the team page.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function edit(req: Request, res: Response) {
    const { teamName, newTeamName, collegeName, pictureBase64, bio, playersRemoved } = req.body;

    try {
        let teamPictureLocation: string | null = null;

        const team = await getTeam({ name: teamName, includeRelations: ['players'] }) as Team & { players: User[]; };

        if (pictureBase64) {
            teamPictureLocation = await uploadFile(`${team.id}/teamPicture`, base64ToBuffer(pictureBase64));
        }

        let updatedPlayers: { email: string }[] | undefined;

        // filter team players to build an array of { email: string } objects which will represent the remaining
        // players in the team, after one or more has been removed
        if ((playersRemoved && playersRemoved.length) && team.players.length) {
            updatedPlayers = team.players.map((player: User) => {
                return { email: player.email };
            }).filter((mappedPlayer: { email: string }) => {
                return !playersRemoved.includes(mappedPlayer.email);
            });
        }

        let newCollege: College | null = null;

        if (collegeName) {
            newCollege = await prismaClient.college.findFirst({
                where: {
                    name: collegeName
                }
            });
        }

        let now = new Date();

        if (newCollege) {
            let teamTournament: Tournament | null = null;

            if (team.tournament_id) {
                teamTournament = await prismaClient.tournament.findFirst({
                    where: {
                        id: team.tournament_id
                    }
                })
            }

            if (teamTournament && now >= teamTournament.deadline) {
                throw new CustomError('You cannot switch colleges because your tournament is ongoing');
            }

            let newCollegeTournament: Tournament | null = null;

            if (newCollege.tournament_id) {
                newCollegeTournament = await prismaClient.tournament.findFirst({
                    where: {
                        id: newCollege.tournament_id
                    }
                });
            }

            if (newCollegeTournament && now >= newCollegeTournament.deadline) {
                throw new CustomError(`You cannot switch colleges because ${newCollege.name}'s tournament is ongoing`);
            }
        }

        // dynamically attach each property since some fields from frontend might be undefined since they aren't touched
        const updatedTeam = await prismaClient.team.update({
            data: {
                ...(newTeamName && { name: newTeamName }),
                ...(newCollege && {
                    college_id: newCollege.id,
                    ...(newCollege.tournament_id && {
                        tournament_id: newCollege.tournament_id
                    })
                }),
                ...((teamPictureLocation || bio) && {
                    page: {
                        // store s3 bucket location of picture into team's 'picture' attribute in the database.
                        // make sure we're falling back on the team.page.picture/team.page.bio objects, otherwise these
                        // values will become empty in the database if they're undefined
                        ...((teamPictureLocation && { picture: teamPictureLocation }) || { picture: team.page?.picture }),
                        ...((bio && { bio: bio }) || { bio: team.page?.bio })
                    }
                }),
                ...((updatedPlayers) && {
                    players: {
                        // pass the updated list of players
                        set: updatedPlayers
                    }
                }),
            },
            where: {
                name: teamName
            },
            select: {
                name: true,
                review_status: true,
                college: true,
                page: true,
                players: true,
                upvotes: true
            }
        });

        const teamPicture = await downloadFile(`${team.id}/teamPicture.jpg`);

        return res.status(200).send({
            // return updated version of team and location of picture uploaded
            team: updatedTeam,
            teamPictureLocation: teamPictureLocation,
            teamPicture: atob(bufferToBase64(teamPicture))
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if editing the team page failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error updating team information. Please try again.',
        });
    }
}

/**
 * Controller for deleting a team.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function deleteTeam(req: Request, res: Response) {
    const { teamName, email } = req.body;

    try {
        const team = await getTeam({ name: teamName, includeRelations: ['players'] }) as Team & { players: User[] };

        await prismaClient.team.delete({
            where: {
                name: teamName
            }
        });

        const users = await getUsers({ dbFields: ['id', 'invites'] });

        for (const user of users) {
            await prismaClient.user.update({
                where: {
                    id: user.id
                },
                data: {
                    invites: {
                        set: user.invites.filter(teamId => teamId !== team.id)
                    },
                }
            });
        }

        let authToken: string | null = null;

        if (team.players) {
            const playerIds = team.players.map(player => player.id);

            await prismaClient.user.updateMany({
                where: {
                    id: {
                        in: playerIds
                    },
                    role: {
                        in: [Role.TEAM_CAPTAIN, Role.PLAYER]
                    }
                },
                data: {
                    role: Role.REGISTERED_USER
                }
            });

            const user = await getUser({ email, dbFields: ['id', 'role', 'email'] });

            if (playerIds.includes(user.id)) {
                authToken = generateAuthToken(user.email, user.role);
            }
        }

        return res.status(200).send({
            deletedTeam: team,
            authToken
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if deleting the team failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error deleting team. Please try again.',
        });
    }
}

/**
 * Controller for creating a team.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function createTeamController(req: Request, res: Response) {
    const { userId, teamName, collegeName, pictureBase64, bio } = req.body;

    try {
        const user = await getUser({ id: userId, dbFields: ['id', 'role', 'team_id', 'college_id', 'email'] });

        if (user.team_id) {
            throw new Error('You are already part of a team');
        }

        if (!user.college_id && compareRoleTo(user.role, Role.UNIVERSITY_MARKETING_MOD) === -1) {
            throw new CustomError('You must be part of a college to create a team');
        }

        const team = await createTeam(teamName, collegeName, pictureBase64, bio);

        const comparedRole = compareRoleTo(user?.role, Role.TEAM_CAPTAIN);

        let authToken: string | null = null;

        if (comparedRole === -1) {
            authToken = generateAuthToken(user.email, user.role);

            await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    role: Role.TEAM_CAPTAIN
                }
            });
        }

        if (comparedRole <= 0) {
            await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    team_id: team.id
                }
            })
        }

        return res.status(200).send({
            team,
            authToken
        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if creating the team failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error creating team. Please try again.',
        });
    }
}
