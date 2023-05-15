import { NextFunction, Request, Response } from 'express';

export class CORSError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CORSError';
    }
};

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CORSError) {
        return res.status(403).send(`${req.socket.remoteAddress} from ${req.headers.origin || 'N/A'} tried to connect: ${err.message}`);
    }

    return res.status(500).send('Internal Server Error');
};

export default errorHandler;