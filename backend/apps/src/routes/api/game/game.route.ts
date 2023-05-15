import { jwtValidation } from "apps/src/auth/jwt";
import { bracketing, updateMatch } from "apps/src/controllers/api/game/game.controller";
import { Router } from "express";

// router for bracket routes
const gameRouter: Router = Router();

gameRouter.get('/bracketing', bracketing);

gameRouter.post('/bracketing/match', [jwtValidation], updateMatch);

export default gameRouter;