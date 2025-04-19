import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function verifyjwt(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(401).json({ error: true, message: "Unauthorized user" });
    return;
  }

  try {
    const parts = token.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res
        .status(401)
        .json({ error: true, message: "Token missing or invalid" });
      return;
    }
    const accessToken = parts[1];

    if (!process.env.PRIVATEKEY) {
      res
        .status(500)
        .json({
          error: true,
          message: "Server configuration error: PRIVATEKEY missing",
        });
      return;
    }

    const decoded = verify(accessToken, process.env.PRIVATEKEY) as
      | JwtPayload
      | undefined;
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("id" in decoded) ||
      !("email" in decoded)
    ) {
      res.status(401).json({ error: true, message: "Invalid token payload" });
      return;
    }
    req.user = decoded as JwtPayload;

    next(); // Continue to the next middleware/route handler
  } catch (error) {
    res.status(401).json({ error: true, message: "Invalid token" });
  }
}

export { verifyjwt };
