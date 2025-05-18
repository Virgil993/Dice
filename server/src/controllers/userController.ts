import { Gender } from "@/db/models/user";
import { UserCreateDTO, UserDTO } from "@/dtos/user";
import { UserService } from "@/services/userService";
import { validateUserCreateInput } from "@/utils/validation";
import { Request, Response } from "express";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async createUser(req: Request, res: Response) {
    const userInfo = req.body.user as UserCreateDTO;
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
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
}
