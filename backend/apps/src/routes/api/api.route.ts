import { Router } from "express";
import adminRouter from './admin/admin.route';
import authRouter from "./auth/auth.route";
import participantProfileRouter from "./participantProfile/participantProfile.route";
import searchRouter from "./search/search.route";
import teamRouter from "./team/team.route";
import participantProfileInvitesRouter from "./teamInvites/teamInvites.route";
import teamPageRouter from "./teamPage/teamPage.route";
import tournamentRouter from "./tournament/tournament.route";
import collegeRouter from "./university/university.route";
import gameRouter from "./game/game.route";

// router for any /api routes
const apiRouter: Router = Router();

// /api/auth path middleware
apiRouter.use('/auth', authRouter);

// /api/participantProfile path AKA participant profile page middleware
apiRouter.use('/participantProfile', participantProfileInvitesRouter);

// /api/team path for middleware dealing with teams
apiRouter.use('/team', teamRouter);

// /api/tournament path for middleware dealing with tournaments
apiRouter.use('/tournament', tournamentRouter);

// /api/college path for middleware dealing with colleges
apiRouter.use('/college', collegeRouter);

// /api/auth path middleware
apiRouter.use('/participantProfile', participantProfileRouter);

// /api/home path AKA tournament home page middleware
apiRouter.use('/teamPage', teamPageRouter);

// /api/admin oath for admin dashboard functionalities
apiRouter.use('/admin', adminRouter);

// /api/search path for search functionalities
apiRouter.use('/search', searchRouter);

// /api/game path for games
apiRouter.use('/game', gameRouter);

export default apiRouter;