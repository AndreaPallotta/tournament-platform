import { Role } from '@prisma/client';
import validate from 'apps/src/middleware/validator';
import { prismaModels } from 'apps/src/prisma/prisma.client';
import { body, query, ValidationChain } from 'express-validator';

// transform/validate firstName fields coming through api/auth routes
const firstNameValidation: ValidationChain = body('first_name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('First name is empty')
    .isLength({ max: 20 })
    .withMessage('First name is too long');

// transform/validate lastName fields coming through api/auth routes
const lastNameValidation: ValidationChain = body('last_name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Last name is empty')
    .isLength({ max: 20 })
    .withMessage('Last name is too long');

// transform/validate display_name fields coming through api/auth routes
const displayNameValidation: ValidationChain = body('display_name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Display name is empty')
    .isLength({ max: 16 })
    .withMessage('Display name is too long');

// transform/validate email fields coming through api/auth routes
const emailValidation: ValidationChain = body('email')
    .notEmpty()
    .withMessage('Email is empty')
    .isLength({ max: 30 })
    .withMessage('Email is too long')
    .trim()
    .escape()
    .isEmail()
    .withMessage('Email is invalid');

// transform/validate password fields coming through api/auth routes
const passwordValidation: ValidationChain = body('password')
    .notEmpty()
    .withMessage('Password is empty')
    .isLength({ max: 20 })
    .withMessage('Password is too long')
    .trim()
    .escape()
    .isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage('Password is too weak');

// chain of validation handlers the api/auth/signup routes
export const signupValidation = validate([
    firstNameValidation,
    lastNameValidation,
    displayNameValidation,
    emailValidation,
    passwordValidation,
    body('confirm_password')
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage('Password and confirm password are not matching'),
]);

// chain of validation handlers the api/auth/login routes
export const signInValidation = validate([emailValidation, passwordValidation]);

// chain of validation handlers the api/auth/forgotpassword routes
export const forgotPasswordValidation = validate([emailValidation]);

// chain of validation handlers the api/auth/passwordreset routes
export const passwordResetValidation = validate([
    emailValidation,
    passwordValidation,
]);

export const refreshValidation = validate([
    body('token')
        .notEmpty()
        .withMessage('Refresh token not provided')
        .bail()
        .isString()
        .withMessage('Refresh token must be a string'),
]);

export const dynRouteValidation = validate([
    query('model').isString().notEmpty().custom((value: string) => {
        if (!prismaModels.includes(value)) {
            throw new Error(`Invalid model ${value}`);
        }
        return true;
    }),
    query('fieldName').isString().notEmpty(),
    query('fieldValue').isString().notEmpty(),
]);

export const deleteAccountValidation = validate([
    body('userId').isMongoId(),
    body('teamId').optional().isMongoId().if(body('teamId').exists()).notEmpty(),
])
