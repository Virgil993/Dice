import { Secrets } from "@/config/secrets";
import { Gender } from "@/db/models/user";
import {
  Status,
  UserCreateRequest,
  UserLoginRequest,
  UserUpdateRequest,
} from "@/dtos/request";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { UserService } from "@/services/userService";
import { messageToErrorResponse } from "@/utils/helper";
import {
  validateDescription,
  validateGames,
  validateGender,
  validateName,
  validatePassword,
  validateUserCreateInput,
} from "@/utils/validation";
import { NextFunction, Request, Response } from "express";

export class UserController {
  private userService: UserService;
  private rateLimiters: RateLimitMiddlewares;

  constructor(secrets: Secrets, rateLimiters: RateLimitMiddlewares) {
    this.userService = new UserService(secrets);
    this.rateLimiters = rateLimiters;
  }

  public async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userInfo = req.body.user as UserCreateRequest;
    const files = req.files as Express.Multer.File[];
    if (!userInfo) {
      res.status(400).json(messageToErrorResponse("User info is required"));
      return;
    }
    if (!files) {
      res.status(400).json(messageToErrorResponse("Files are required"));
      return;
    }
    try {
      await validateUserCreateInput(userInfo, files);
      const user = await this.userService.createUser(
        userInfo.name,
        userInfo.email,
        userInfo.password,
        userInfo.birthday,
        userInfo.gender as Gender,
        userInfo.description,
        userInfo.gameIds,
        files
      );

      res.status(201).json(user);
      return;
    } catch (error) {
      console.error("Error creating user:", error);
      next(error);
    }
  }

  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    const userInfo = req.body.user as UserUpdateRequest;
    const files = req.files as Express.Multer.File[];
    if (!userInfo) {
      res.status(400).json(messageToErrorResponse("User info is required"));
      return;
    }
    if (!files) {
      res.status(400).json(messageToErrorResponse("Files are required"));
      return;
    }
    try {
      if (userInfo.description) {
        validateDescription(userInfo.description);
      }
      if (userInfo.gender) {
        validateGender(userInfo.gender);
      }
      if (userInfo.name) {
        validateName(userInfo.name);
      }
      if (userInfo.gameIds) {
        if (!Array.isArray(userInfo.gameIds)) {
          res
            .status(400)
            .json(
              messageToErrorResponse("gameIds must be an array of strings")
            );
          return;
        }
        validateGames(userInfo.gameIds);
      }
      const user = await this.userService.updateUser(userId, userInfo, files);
      res.status(200).json(user);
      return;
    } catch (error) {
      console.error("Error updating user:", error);
      next(error);
    }
  }

  public async loginUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email, password } = req.body as UserLoginRequest;
    const userAgent = req.headers["user-agent"] || "";
    if (!email || !password) {
      await this.rateLimiters.recordFailedLogin(req);
      res
        .status(400)
        .json(messageToErrorResponse("Email and password are required"));
      return;
    }
    try {
      const user = await this.userService.loginUser(email, password, userAgent);
      await this.rateLimiters.clearLoginAttempts(req);
      res.status(200).json(user);
    } catch (error) {
      console.error("Error logging in user:", error);
      await this.rateLimiters.recordFailedLogin(req);
      next(error);
    }
  }

  public async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    console.log("Fetching user with ID:", userId);
    try {
      const user = await this.userService.getUserById(userId);

      res.status(200).json(user);
      return;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      next(error);
    }
  }

  public async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json(messageToErrorResponse("User ID is required"));
      return;
    }
    try {
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
      return;
    } catch (error) {
      console.error("Error fetching external user by ID:", error);
      next(error);
    }
  }

  public async getUsersSorted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.userId;
    if (!userId) {
      res.status(400).json(messageToErrorResponse("User ID is required"));
      return;
    }
    try {
      const users = await this.userService.getUsersSorted(userId);
      res.status(200).json(users);
      return;
    } catch (error) {
      console.error("Error fetching sorted users:", error);
      next(error);
    }
  }

  public async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const newPassword = req.body.password;
    const { userId, token } = req.query;
    if (!token || !newPassword || !userId) {
      res
        .status(400)
        .json(
          messageToErrorResponse("Token, userId and newPassword are required")
        );
      return;
    }
    try {
      validatePassword(newPassword);
      await this.userService.resetPassword(
        userId.toString(),
        token.toString(),
        newPassword
      );
      res.status(200).json({
        status: Status.SUCCESS,
      });
      return;
    } catch (error) {
      console.error("Error resetting password:", error);
      next(error);
    }
  }
}
