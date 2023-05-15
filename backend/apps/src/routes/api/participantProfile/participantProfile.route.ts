import { jwtValidation } from "apps/src/auth/jwt";
import { getUserInfoController, updateInfoController } from "apps/src/controllers/api/participantProfile/participantProfile.controller";
import { getUserInfoValidation, updateInfoValidation } from "apps/src/validation/api/participantProfile/participantProfile.validation";
import { Router } from "express";

/**
 * General structure for any POST response objects in /api/auth routes,
 * and their child routes.
 *
 * @export
 * @interface IPostResponseBody
 */
export interface IPostResponseBody {
    successful?: {
        [key: string]: any
    },
    error?: string
}

// router for authentication routes
const participantProfileRouter: Router = Router();

// /api/participantProfile/ path
participantProfileRouter.get('/', getUserInfoValidation, getUserInfoController)

// /api/participantProfile/update path
participantProfileRouter.post('/updateInfo', [jwtValidation, updateInfoValidation], updateInfoController)

export default participantProfileRouter;