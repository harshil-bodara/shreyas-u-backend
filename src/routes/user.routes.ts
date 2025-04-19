import { Router } from "express";
import { inviteUser, login, getConnections, WithdrawConnection } from "../controllers/user.controller";
import { ignoreUser } from "../controllers/userignore.controller";
import { verifyjwt } from "../middleware/auth.middleware";

const userRoutes = Router();

userRoutes.post("/login", login);
userRoutes.get("/invite", verifyjwt, inviteUser);
userRoutes.get('/connections', verifyjwt, getConnections);
userRoutes.post('/withdrawconnection',verifyjwt, WithdrawConnection);
userRoutes.post('/ignore', verifyjwt, ignoreUser);


export default userRoutes;
