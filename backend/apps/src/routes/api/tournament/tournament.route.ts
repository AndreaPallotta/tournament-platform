import { jwtValidation } from "apps/src/auth/jwt";
import { createTournamentController, edit, generateTournamentGames, tournamentPage } from "apps/src/controllers/api/tournament/tournament.controller";
import { Router } from "express";

// router for tournament routes
const tournamentRouter: Router = Router();


tournamentRouter.get('/', tournamentPage);

// tournamentRouter.post('/invite', [jwtValidation, inviteValidation], invitePlayers);

tournamentRouter.post('/edit', jwtValidation, edit);

// tournamentRouter.post('/delete', jwtValidation, deleteTeam);

tournamentRouter.post('/create', jwtValidation, createTournamentController);

tournamentRouter.post('/generatebrackets', jwtValidation, generateTournamentGames);

export default tournamentRouter;