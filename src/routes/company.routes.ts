import { Router } from "express";
import { handleCompanyFollowUnfollow } from "../controllers/company.controller";
import { verifyjwt } from "../middleware/auth.middleware";


const companyRouter = Router();
// follow \\ unfollow
companyRouter.post("/:actionType", verifyjwt, handleCompanyFollowUnfollow);

export default companyRouter;
