import validate from 'apps/src/middleware/validator';
import { body, ValidationChain } from 'express-validator';

// transform/validate firstName fields coming through api/auth routes
const teamIDValidation: ValidationChain = body('id')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Team id is empty')
    .isLength({ max: 150 })
    .withMessage('Team id is too long');

const userIdValidation: ValidationChain = body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is empty')
    .isLength({ min: 24, max: 24 })
    .withMessage('Invalid user ID')
    .isMongoId()
    .withMessage('Invalid user ID');

const teamNameValidation: ValidationChain = body('teamName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Team name is empty')
    .isLength({ max: 20 })
    .withMessage('Team name is too long');

export const teamPageValidation = validate([teamIDValidation]);

export const upvoteTeamPageValidation = validate([userIdValidation, teamNameValidation]);