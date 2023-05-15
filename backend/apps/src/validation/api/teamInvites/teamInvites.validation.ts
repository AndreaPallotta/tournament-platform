import validate from 'apps/src/middleware/validator';
import { body, ValidationChain } from 'express-validator';

// transform/validate teamID fields coming through api/participantProfile routes
const teamIDValidation: ValidationChain = body('team_id')
    .trim()
    .notEmpty()
    .withMessage('Team ID is empty')
    .isLength({ min: 24, max: 24 })
    .withMessage('Invalid team ID')
    .isMongoId()
    .withMessage('Invalid team ID');

const userIdValidation: ValidationChain = body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is empty')
    .isLength({ min: 24, max: 24 })
    .withMessage('Invalid user ID')
    .isMongoId()
    .withMessage('Invalid user ID');

// transform/validate email fields coming through api/participantProfile routes
const emailValidation: ValidationChain = body('email')
    .notEmpty()
    .withMessage('Email is empty')
    .isLength({ max: 50 })
    .withMessage('Email is too long')
    .trim()
    .escape()
    .isEmail()
    .withMessage('Email is invalid');

const teamNameValidation: ValidationChain = body('teamName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Team name is empty')
    .isLength({ max: 20 })
    .withMessage('Team name is too long')

// chain of validation handlers the api/participantProfile/acceptInvite routes
export const acceptInviteValidation = validate([teamNameValidation, userIdValidation]);

// chain of validation handlers the api/participantProfile/rejectInvite routes
export const rejectInviteValidation = validate([userIdValidation, teamNameValidation]);

// chain of validation handlers the api/participantProfile/leaveTeam routes
export const leaveTeamValidation = validate([userIdValidation, teamNameValidation]);