import { jwtValidation } from "apps/src/auth/jwt";
import { teamPageController, upvoteTeamPageController } from "apps/src/controllers/api/teamPage/teamPage.controller";
import { teamPageValidation, upvoteTeamPageValidation } from "apps/src/validation/api/teamPage/teamPage.validation";
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
        [key: string]: any;
    };
    error?: string;
}

// router for the tournament teamPage
const teamPageRouter: Router = Router();

// Route to teamPage
teamPageRouter.get('/', teamPageValidation, teamPageController);

// Route to teamPage
teamPageRouter.post('/upvote', [jwtValidation, upvoteTeamPageValidation], upvoteTeamPageController);

export default teamPageRouter;