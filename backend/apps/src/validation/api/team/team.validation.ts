import validate from 'apps/src/middleware/validator';
import { body } from 'express-validator';

// chain of validation handlers the api/team/invite routes
export const inviteValidation = validate([
    body('email')
        .isLength({ max: 30 })
        .withMessage('Email is too long')
        .trim()
        .escape()
        .isEmail()
        .withMessage('Email is invalid')
]);

// chain of validation handlers the api/team/edit routes
export const editValidation = validate([
    body('newTeamName')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 30 })
        .withMessage('New team name is too long'),
    body('collegeName')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 30 })
        .withMessage('College name is too long'),
    body('pictureName')
        .optional()
        .trim()
        .escape(),
    body('pictureBase64')
        .trim()
        .isString()
        .withMessage('Image is invalid')
        .optional(),
    body('bio')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 200 })
        .withMessage('Team bio is too long'),
    body('playersRemoved')
        .optional()
        .isArray()
        .withMessage('Invalid list of removed players')
]);