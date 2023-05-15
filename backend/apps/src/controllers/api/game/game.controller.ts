import { Game, GameStatus, GameTeams, Team } from "@prisma/client";
import { getGame, getGameTeams } from "apps/src/crud/game.crud";
import logger from "apps/src/middleware/logger";
import prismaClient from "apps/src/prisma/prisma.client";
import { Match, Participant } from "apps/src/types/game.types";
import CustomError from "apps/src/utils/error";
import { Request, Response } from "express";

/**
 * Controller for getting bracketing info.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function bracketing(req: Request, res: Response) {
    const { tournamentId, collegeId } = req.query as { tournamentId?: string; collegeId?: string };

    try {
        const gameTeams = await getGameTeams({
            tournamentId,
            collegeId,
        });

        const matches: Match[] | undefined = gameTeams.games?.sort((game1: Game, game2: Game) => game1.round - game2.round).map((game: Game) => {
            const participant1: Team | undefined = (gameTeams.teams || []).find((team: Team) => team.id === game.teams.team1_id);
            const participant2: Team | undefined = (gameTeams.teams || []).find((team: Team) => team.id === game.teams.team2_id);


            const nextMatch: Game | undefined = (gameTeams.games || []).find(((nextGame: Game) => nextGame.id === game.nextId));

            return {
                id: game.id,
                name: `${participant1?.name || 'TBD'} vs ${participant2?.name || 'TBD'}`,
                nextMatchId: nextMatch?.id || null,
                tournamentRoundText: String(game.round),
                startTime: '',
                state: game.status || '',
                participants: [
                    {
                        id: participant1?.id || '',
                        resultText: String(game.teams.team1_score) ?? 'TBD',
                        isWinner: game.winner === participant1?.id,
                        name: participant1?.name,
                    },
                    {
                        id: participant2?.id || '',
                        resultText: String(game.teams.team2_score) ?? 'TBD',
                        isWinner: game.winner === participant2?.id,
                        name: participant2?.name,
                    },
                ],
            };
        });

        if (!matches) {
            throw new CustomError('Error while generating bracketing information');
        }

        return res.status(200).send({
            games: gameTeams.games,
            matches,
            teams: gameTeams.teams
        });

    }
    catch (err) {
        logger.error(err.message);
        // send back error response if getting games/teams info failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Something went wrong when loading bracketing info. Please try again.',
        });
    }
}

/**
 * Controller for updating games based on the edits made in a bracketing component.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function updateMatch(req: Request, res: Response) {
    const { match, firstScore, secondScore, gameState } = req.body;

    try {
        const originalGameTeams: GameTeams = (await getGame({ gameId: match.id })).teams;

        const newGameTeams: GameTeams = {
            ...originalGameTeams,
            ...(firstScore && { team1_score: Number(firstScore) }),
            ...(secondScore && { team2_score: Number(secondScore) })
        };

        let updatedGame: Game;

        updatedGame = await prismaClient.game.update({
            data: {
                teams: newGameTeams,
                ...(gameState && { status: gameState }),
            },
            where: {
                id: match.id
            }
        });

        let winner: string | null = null;

        if (+updatedGame.teams.team1_score >= 3) {
            winner = updatedGame.teams.team1_id;
        } else if (+updatedGame.teams.team2_score >= 3) {
            winner = updatedGame.teams.team2_id;
        }

        let nextMatch;

        if (winner) {
            updatedGame = await prismaClient.game.update({
                where: {
                    id: updatedGame.id
                },
                data: {
                    winner,
                    status: GameStatus.PLAYED,
                },
            });

            if (match.nextMatchId) {
                const nextGameToUpdate = await prismaClient.game.findFirstOrThrow({
                    where: {
                        id: match.nextMatchId,
                    },
                });

                let nextGameTeam;

                if (!nextGameToUpdate?.teams.team1_id) {
                    nextGameTeam = {
                        ...nextGameToUpdate?.teams,
                        team1_id: winner
                    };
                } else if (nextGameToUpdate?.teams?.team1_id && !nextGameToUpdate?.teams?.team2_id) {
                    nextGameTeam = {
                        ...nextGameToUpdate?.teams,
                        team2_id: winner
                    };
                }

                const nextGame = await prismaClient.game.update({
                    where: {
                        id: match.nextMatchId,
                    },
                    data: {
                        teams: {
                            set: nextGameTeam as GameTeams
                        },
                        status: (nextGameTeam.team1_id && nextGameTeam.team2_id) ? GameStatus.IN_PROGRESS : GameStatus.UNSTARTED
                    }
                });

                const [team1, team2] = await prismaClient.team.findMany({
                    where: {
                        id: {
                            in: [...(nextGame.teams.team1_id ? [nextGame.teams.team1_id] : []), ...(nextGame.teams.team2_id ? [nextGame.teams.team2_id] : [])]
                        }
                    },
                    select: {
                        name: true,
                        id: true,
                    }
                });

                const participants: Participant[] = [
                    {
                        id: team1?.id || '',
                        resultText: String(nextGame.teams.team1_score) ?? 'TBD',
                        isWinner: nextGame.winner === team1?.id,
                        name: team1?.name,
                    },
                    {
                        id: team2?.id || '',
                        resultText: String(nextGame.teams.team2_score) ?? 'TBD',
                        isWinner: nextGame.winner === team2?.id,
                        name: team2?.name,
                    },
                ];

                nextMatch = {
                    id: nextGame.id,
                    nextMatchId: nextGame.nextId,
                    participants,
                    startTime: '',
                    state: (nextGameTeam.team1_id && nextGameTeam.team2_id) ? GameStatus.IN_PROGRESS : GameStatus.UNSTARTED,
                    name: `${team1?.name || 'TBD'} vs ${team2?.name || 'TBD'}`,
                    tournamentRoundText: String(nextGame.round),
                } as Match;
            }
        }

        let updatedMatch;

        if (updatedGame) {
            updatedMatch = {
                ...match,
                state: updatedGame.status,
                participants: [
                    {
                        id: match.participants[0].id,
                        resultText: firstScore ?? match.participants[0].resultText ?? 'TBD',
                        isWinner: updatedGame.winner === match.participants[0].id,
                        name: match.participants[0].name,
                    },
                    {
                        id: match.participants[1].id,
                        resultText: secondScore ?? match.participants[1].resultText ?? 'TBD',
                        isWinner: updatedGame.winner === match.participants[1].id,
                        name: match.participants[1].name,
                    },
                ],
            };
        }

        return res.status(200).send({
            game: updatedGame,
            match: updatedMatch,
            nextMatch,

        });
    } catch (err) {
        logger.error(err.message);
        // send back error response if updating game scores failed
        return res.status(500).json({
            error: err instanceof CustomError ? err.message : 'Error updating match scores. Please try again.'
        });
    }
}
