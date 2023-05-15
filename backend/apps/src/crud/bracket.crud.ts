import { Game, GameStatus, Team } from "@prisma/client";
import prismaClient from "../prisma/prisma.client";

export const calculateBracketRounds = (numTeams: number) => {
    return Math.ceil(Math.log2(numTeams));
}

export class GameNode {
    game: Partial<Game>;
    left: GameNode | null;
    right: GameNode | null;

    constructor(game: Partial<Game>) {
        this.game = game;
        this.left = null;
        this.right = null;
    }
}

export const createRounds = async (
    tournament_id: string,
    teams: Team[]
): Promise<GameNode> => {
    const totalRounds = calculateBracketRounds(teams.length);
    let roundNodes: GameNode[] = [];

    for (let i = 0; i < teams.length; i += 2) {
        const team1 = teams[i];
        const team2 = teams[i + 1];

        const game: Partial<Game> = {
            round: 1,
            status: team2?.id ? GameStatus.IN_PROGRESS : GameStatus.PLAYED,
            nextId: null,
            tournament_id,
            teams: {
                team1_id: team1.id,
                team1_score: 0,
                team2_id: team2?.id || null,
                team2_score: 0,
            },
            winner: team2 ? null : team1.id,
        };

        const { id } = await prismaClient.game.create({ data: game as Game });
        const node = new GameNode(game);
        node.game.id = id;
        roundNodes.push(node);
    }

    for (let round = 2; round <= totalRounds; round++) {
        const nextRoundNodes: GameNode[] = [];

        for (let i = 0; i < roundNodes.length; i += 2) {
            const leftNode = roundNodes[i];
            const rightNode = roundNodes[i + 1] || null;

            const game: Partial<Game> = {
                round,
                status: GameStatus.UNSTARTED,
                nextId: null,
                tournament_id,
                teams: {
                    team1_id: null,
                    team1_score: 0,
                    team2_id: null,
                    team2_score: 0,
                },
                winner: null,
            };

            const { id } = await prismaClient.game.create({ data: game as Game });
            const node = new GameNode(game);
            node.game.id = id;
            node.left = leftNode;
            node.right = rightNode;

            leftNode.game.nextId = id;
            if (rightNode) {
                rightNode.game.nextId = id;
            }

            await prismaClient.game.update({
                where: { id: leftNode.game.id },
                data: { nextId: id },
            });

            if (rightNode) {
                await prismaClient.game.update({
                    where: { id: rightNode.game.id },
                    data: { nextId: id },
                });
            }

            nextRoundNodes.push(node);
        }

        roundNodes = nextRoundNodes;
    }
    return roundNodes[0];
};