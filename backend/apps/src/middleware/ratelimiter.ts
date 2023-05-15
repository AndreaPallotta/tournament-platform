/* eslint-disable @typescript-eslint/no-unused-vars */
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { DEV, TEST } from '../utils/env.config';

export default rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (DEV || TEST) ? 10000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: async (req: Request, res: Response) => {
        return 'You can only make 100 requests per hour';
    },
});
