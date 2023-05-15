import { jwtValidation } from "apps/src/auth/jwt";
import { createTeamController, deleteTeam, edit, invitePlayers, teamPage } from "apps/src/controllers/api/team/team.controller";
import { editValidation, inviteValidation } from "apps/src/validation/api/team/team.validation";
import { Router } from "express";

// router for team routes
const teamRouter: Router = Router();

teamRouter.get('/', teamPage);

teamRouter.post('/invite', [jwtValidation, inviteValidation], invitePlayers);

teamRouter.post('/edit', [jwtValidation, editValidation], edit);

teamRouter.post('/delete', jwtValidation, deleteTeam);

teamRouter.post('/create', jwtValidation, createTeamController);

export default teamRouter;