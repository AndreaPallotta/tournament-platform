import { getTeam } from 'apps/src/crud/team.crud';
import { upvoteTeam } from 'apps/src/crud/teamPage.crud';
import CustomError from 'apps/src/utils/error';
import { Request, Response } from 'express';
import logger from '../../../middleware/logger';

/**
 * Controller for dealing with getting the Team Page's info
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function teamPageController(req: Request, res: Response) {
    const { id } = req.body;

    try {

        const team = await getTeam({
            id, dbFields: [
                'id',
                'name',
                'college_id',
                'college',
                'players',
                'page',
                'upvotes',
                'tournament_ids',
                'tournaments',
                'current_game',
                'review_status'
            ]
        });

        if (!team) {
            return res.status(404).json({
                error: 'Cannot find a Team with that Team Name. Please try again.',
            });
        }

        return res.status(200).json(team);
    } catch (err) {
        logger.error(err.message);
        return res
            .status(500)
            .json({ error: err instanceof CustomError ? err.message : `Error retrieving team information` });
    }
}

/**
 * Controller for dealing with upvoting the team
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response<any, Record<string, any>>>}
 */
export async function upvoteTeamPageController(req: Request, res: Response) {
    const { userId, teamName, upvote } = req.body;

    try {
        const team = await upvoteTeam({ teamName, userId, upvote });

        return res.status(200).json({
            team
        });
    } catch (err) {
        logger.error(err.message);
        return res
            .status(500)
            .json({ error: err instanceof CustomError ? err.message : `Error upvoting team` });
    }
}