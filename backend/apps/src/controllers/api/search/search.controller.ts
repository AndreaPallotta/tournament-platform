import { Team } from '@prisma/client';
import { searchColleges } from 'apps/src/crud/university.crud';
import CustomError from 'apps/src/utils/error';
import { Request, Response } from 'express';
import logger from "../../../middleware/logger";

export const searchParticipantController = async (req: Request, res: Response) => {
    const { searchTerm } = req.query;

    try {
        const colleges = await searchColleges(searchTerm as string, ["name", "teams"]);

        const results = colleges.map((college: any) => ({
            name: college.name,
            teams: college.teams.map((team: Team) => team.name)
        }));

        return res.status(200).json({ results });
    } catch (err) {
        logger.error(err.message);
        return res.status(500).json({ error: err instanceof CustomError ? err.message : `Error searching for colleges: ${err.message}` });
    }
};