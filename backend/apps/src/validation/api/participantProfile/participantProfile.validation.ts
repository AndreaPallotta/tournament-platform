import validate from "apps/src/middleware/validator";
import { body, query } from "express-validator";
import { ValidationChain } from "express-validator/src/chain";

const userIDValidation: ValidationChain = query('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is empty')
    .isLength({ min: 24, max: 24 })
    .withMessage('Invalid user ID')
    .isMongoId()
    .withMessage('Invalid user ID');

const userIdBodyValidation: ValidationChain = body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is empty')
    .isLength({ min: 24, max: 24 })
    .withMessage('Invalid user ID')
    .isMongoId()
    .withMessage('Invalid user ID');

const pictureValidation: ValidationChain = body('pictureBase64')
    .trim()
    .isString()
    .withMessage('Image is invalid')
    .optional();

const collegeNameValidation: ValidationChain = body('collegeName')
    .isString()
    .trim()
    .isLength({ max: 60 })
    .withMessage('College name is too long')
    .optional();

// transform/validate lastName fields coming through api/auth routes
const displayNameValidation: ValidationChain = body('display_name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Display name is empty')
    .isLength({ max: 16 })
    .withMessage('Display name is too long')
    .optional();

// transform/validate email fields coming through api/auth routes
const emailValidation: ValidationChain = body('email')
    .notEmpty()
    .withMessage('Email is empty')
    .isLength({ max: 40 })
    .withMessage('Email is too long')
    .trim()
    .escape()
    .isEmail()
    .withMessage('Email is invalid');


// transfrom/validate bio fields coming through api/participantProfile routes
const bioValidation: ValidationChain = body('bio')
    .trim()
    .escape()
    .isString()
    .isLength({ max: 300 })
    .withMessage('Bio is too long')
    .optional();

// chain of validation handlers the api/participantProfile/updateInfo routes
export const updateInfoValidation = validate([
    userIdBodyValidation,
    bioValidation,
    pictureValidation,
    collegeNameValidation,
    displayNameValidation
]);

// chain of validation handlers the api/participantProfile routes
export const getUserInfoValidation = validate([
    userIDValidation
]);