import { UserRepository } from "@/repositories/userRepository";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./errorHandler";

export const checkVerification = async (
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
    if (!userDb.verified) {
      res.status(403).json({
        status: "error",
        message: "User not verified",
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
