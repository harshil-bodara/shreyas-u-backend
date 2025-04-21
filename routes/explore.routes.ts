import { Router } from "express";
import { getExplore } from "../controllers/explore.controller";
import { verifyjwt } from "../middleware/auth.middleware";

const exploreRouter = Router();

exploreRouter.get("/", verifyjwt, getExplore);

export default exploreRouter;
