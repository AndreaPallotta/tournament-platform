import { Router } from "express";
import { searchParticipantController } from "../../../controllers/api/search/search.controller";

const searchRouter: Router = Router();

searchRouter.get('/participants', searchParticipantController);

export default searchRouter;