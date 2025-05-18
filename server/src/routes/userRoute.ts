import { UserController } from "@/controllers/userController";
import { fileFilter } from "@/utils/file";
import { Router } from "express";
import multer, { FileFilterCallback, memoryStorage, Multer } from "multer";

export class UserRoutes {
  private router: Router;
  private userController: UserController;
  private fileUpload: Multer;

  constructor() {
    this.router = Router();
    this.userController = new UserController();

    this.fileUpload = multer({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 6,
      },
      fileFilter: fileFilter,
    });

    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post(
      "/register",
      this.fileUpload.array("files", 6),
      (req, res, next) => {
        try {
          if (req.body.user) {
            req.body.user = JSON.parse(req.body.user);
            next();
          } else {
            res.status(400).json({ message: "User info is required" });
          }
        } catch (error) {
          console.error("Error parsing user info:", error);
          res.status(400).json({ message: "Invalid user info" });
        }
      },
      this.userController.createUser.bind(this.userController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
