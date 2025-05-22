import { Secrets } from "@/config/secrets";
import { Gender } from "@/db/models/user";
import { UserCreateRequest, UserDTO } from "@/dtos/user";
import { UserService } from "@/services/userService";
import { validatePassword, validateUserCreateInput } from "@/utils/validation";
import { Request, Response } from "express";

export class UserController {
  private userService: UserService;

  constructor(secrets: Secrets) {
    this.userService = new UserService(secrets);
  }

  public async createUser(
    req: Request,
    res: Response,
    next: Function
  ): Promise<void> {
    const userInfo = req.body.user as UserCreateRequest;
    const files = req.files as Express.Multer.File[];
    if (!userInfo) {
      res.status(400).json({ message: "User info is required" });
      return;
    }
    if (!files) {
      res.status(400).json({ message: "Files are required" });
      return;
    }
    try {
      await validateUserCreateInput(userInfo, files);
    } catch (error: any) {
      console.error("Validation error:", error);
      res.status(400).json({ message: error.message });
      return;
    }
    try {
      const user: UserDTO = await this.userService.createUser(
        userInfo.name,
        userInfo.email,
        userInfo.password,
        userInfo.birthday,
        userInfo.gender as Gender,
        userInfo.description,
        files
      );

      res.status(201).json({
        user: user,
      });
      return;
    } catch (error: any) {
      console.error("Error creating user:", error);
      next(error);
    }
  }

  public async loginUser(
    req: Request,
    res: Response,
    next: Function
  ): Promise<void> {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "";
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }
    try {
      const user = await this.userService.loginUser(email, password, userAgent);
      res.status(200).json(user);
    } catch (error: any) {
      console.error("Error logging in user:", error);
      next(error);
    }
  }

  public async getUser(
    req: Request,
    res: Response,
    next: Function
  ): Promise<void> {
    const userId = req.user!.userId;
    try {
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
      return;
    } catch (error: any) {
      console.error("Error fetching user by ID:", error);
      next(error);
    }
  }

  public async resetPassword(
    req: Request,
    res: Response,
    next: Function
  ): Promise<void> {
    const newPassword = req.body.password;
    const { userId, token } = req.query;
    if (!token || !newPassword || !userId) {
      res
        .status(400)
        .json({ message: "Token, userId and newPassword are required" });
      return;
    }
    try {
      validatePassword(newPassword);
      await this.userService.resetPassword(
        userId.toString(),
        token.toString(),
        newPassword
      );
      res.status(200).json({ message: "Password reset successfully" });
      return;
    } catch (error: any) {
      console.error("Error resetting password:", error);
      next(error);
    }
  }
}
