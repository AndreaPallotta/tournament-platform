import { jwtValidation } from 'apps/src/auth/jwt';
import {
    deleteAccountController,
    forgotPasswordController,
    passwordResetController,
    refreshTokenController,
    signInController,
    signUpController,
    validateDynRouteController,
} from 'apps/src/controllers/api/auth/auth.controller';
import {
    deleteAccountValidation,
    dynRouteValidation,
    forgotPasswordValidation,
    passwordResetValidation,
    refreshValidation,
    signInValidation,
    signupValidation,
} from 'apps/src/validation/api/auth/auth.validation';
import { Router } from 'express';

/**
 * General structure for any POST response objects in /api/auth routes,
 * and their child routes.
 *
 * @export
 * @interface IPostResponseBody
 */
export interface IPostResponseBody {
    successful?: {
        [key: string]: any;
    };
    error?: string;
}

// router for authentication routes
const authRouter: Router = Router();

// /api/auth/signup path
authRouter.post('/signup', signupValidation, signUpController);

// /api/auth/login path
authRouter.post('/login', signInValidation, signInController);

// /api/auth/forgotpassword path
authRouter.post(
    '/forgotpassword',
    [jwtValidation, forgotPasswordValidation],
    forgotPasswordController
);

// /api/auth/update path
authRouter.post(
    '/passwordreset',
    passwordResetValidation,
    passwordResetController
);

// /api/auth/refresh path
authRouter.post('/refresh', refreshValidation, refreshTokenController);

// /api/auth/validateDynRoute path
authRouter.get('/validateDynRoute', dynRouteValidation, validateDynRouteController);

// /api/auth/deleteAccount path
authRouter.post('/deleteAccount', [jwtValidation, deleteAccountValidation], deleteAccountController);

// /api/auth/deleteAccount path
authRouter.post('/deleteAccount', [jwtValidation, deleteAccountValidation], deleteAccountController);

export default authRouter;
