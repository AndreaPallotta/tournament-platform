import { NextFunction, Request, Response } from 'express';
import * as toobusy from 'toobusy-js';

const monitor = (_: Request, res: Response, next: NextFunction) => {
    if (toobusy()) {
        res.status(503).send(
            "We're sorry, but the server is temporarily unavailable. Please try again in a few minutes."
        );
    } else {
        next();
    }
};

export default monitor;
