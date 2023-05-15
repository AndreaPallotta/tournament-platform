import validate from 'apps/src/middleware/validator';
import { body, query, ValidationChain } from 'express-validator';

export const queryValidation = validate([
    body('query')
        .trim()
        .notEmpty()
        .withMessage('Query is empty')
]);