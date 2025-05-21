import { Secrets } from "@/config/secrets";
import { ActiveSessionPayload } from "@/dtos/user";
import { verifyActiveSessionToken } from "@/utils/auth";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      user?: ActiveSessionPayload;
    }
  }
}

export const createAuthMiddleware = (secrets: Secrets) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the user is authenticated
      const authHeader = req.headers.authorization ?? "";

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          status: "error",
          message: "Invalid or expired token",
        });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({
          status: "error",
          message: "Invalid or expired token",
        });
        return;
      }

      const payload = await verifyActiveSessionToken(
        token,
        secrets.active_session_token_secret
      );

      req.user = payload;
      // If authenticated, proceed to the next middleware or route handler
      next();
    } catch (error: any) {
      console.error("Error in auth middleware:", error);
      errorHandler(error, req, res, next);
      return;
    }
  };
};
