import { UserRepository } from "@/repositories/userRepository";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./errorHandler";
import { verifyTotpTempToken } from "@/utils/auth";
import { Secrets } from "@/config/secrets";

export const checkTotpEnabled = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
      return;
    }

    const userDb = await UserRepository.getUserById(user.userId);
    if (!userDb) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    if (!userDb.totpEnabled) {
      res.status(403).json({
        status: "error",
        message: "TOTP not enabled",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking verification:", error);
    errorHandler(error, req, res, next);
    return;
  }
};

export const createTotpTokenMiddleware = (secrets: Secrets) => {
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

      const payload = await verifyTotpTempToken(
        token,
        secrets.totp_temp_token_secret
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
