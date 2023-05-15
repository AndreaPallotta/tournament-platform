import validate from 'apps/src/middleware/validator';
import { body, ValidationChain } from 'express-validator';

// transform/validate firstName fields coming through api/auth routes
const collegeNameValidation: ValidationChain = body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Name is empty');

export const collegePageValidation = validate([collegeNameValidation]);

export const collegeTeamsValidation = validate([collegeNameValidation]);

export const collegeMatchesValidation = validate([collegeNameValidation]);

export const collegeCreateValidation = validate([
    body('collegeName').isString().trim().notEmpty().isLength({ max: 60 }),
    body('bio').isString().trim().notEmpty().isLength({ max: 300 }),
]);