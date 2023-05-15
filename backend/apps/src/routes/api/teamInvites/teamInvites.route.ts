import { jwtValidation } from 'apps/src/auth/jwt';
import { acceptInviteController, leaveTeamController, rejectInviteController } from 'apps/src/controllers/api/teamInvites/teamInvites.controller';
import { acceptInviteValidation, leaveTeamValidation, rejectInviteValidation } from 'apps/src/validation/api/teamInvites/teamInvites.validation';
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
const participantProfileInvitesRouter: Router = Router();

// /api/participantProfile/acceptInvite path
participantProfileInvitesRouter.post('/acceptInvite', [jwtValidation, acceptInviteValidation], acceptInviteController);

// /api/participantProfile/rejectInvite path
participantProfileInvitesRouter.post('/rejectInvite', [jwtValidation, rejectInviteValidation], rejectInviteController);

// /api/participantProfile/leave path
participantProfileInvitesRouter.post('/leaveTeam', [jwtValidation, leaveTeamValidation], leaveTeamController);

export default participantProfileInvitesRouter