import { jwtValidation } from "apps/src/auth/jwt";
import { collegePage, createCollegeController, edit, getCollegeList } from "apps/src/controllers/api/university/university.controller";
import { collegeCreateValidation } from "apps/src/validation/api/university/university.validation";
import { Router } from "express";

// router for tournament routes
const collegeRouter: Router = Router();


collegeRouter.get('/', collegePage);

collegeRouter.get('/colleges', getCollegeList);

collegeRouter.post('/edit', jwtValidation, edit);

// collegeRouter.post('/delete', jwtValidation, deleteTeam);

collegeRouter.post('/create', [jwtValidation, collegeCreateValidation], createCollegeController);

export default collegeRouter;