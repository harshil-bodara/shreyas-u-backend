import { Router } from "express";
import { handleFriendRequest } from "../controllers/friendRequest.controller";
import { verifyjwt } from "../middleware/auth.middleware";


const friendRouter = Router();

friendRouter.all(
  "/:type", // (send|accept|reject|requests)
  verifyjwt,  
  handleFriendRequest  
);

export default friendRouter;