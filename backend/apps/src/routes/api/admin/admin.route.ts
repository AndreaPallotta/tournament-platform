import { Router } from "express";
import { jwtValidation } from "../../../auth/jwt";
import { CrudFunctionsController, DeleteUsersController, GetStatsController, UserPermissionsController, UserRoleUpdateController } from "../../../controllers/api/admin/admin.controller";
import { queryValidation } from "../../../validation/api/admin/admin.validation";


const adminRouter: Router = Router();

adminRouter.post('/crud', [jwtValidation, queryValidation], CrudFunctionsController);
adminRouter.post('/updateRoles', [jwtValidation], UserRoleUpdateController);
adminRouter.post('/deleteUsers', [jwtValidation], DeleteUsersController);
adminRouter.get('/getUsers', [jwtValidation], UserPermissionsController);
adminRouter.get('/getStats', [jwtValidation], GetStatsController);

export default adminRouter;