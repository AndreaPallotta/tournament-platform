import { NextFunction, Request, Response } from 'express';

const contentHeader = (_: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Server', 'Microsoft-IIS/10.0');
    next();
};

export default contentHeader;
