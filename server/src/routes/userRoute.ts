import { Secrets } from "@/config/secrets";
import { UserController } from "@/controllers/userController";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { checkVerification } from "@/middlewares/verification";
import { fileFilter } from "@/utils/file";
import { messageToErrorResponse } from "@/utils/helper";
import { Request, Response, NextFunction, Router } from "express";
import multer, { memoryStorage, Multer } from "multer";

export class UserRoutes {
  private router: Router;
  private userController: UserController;
  private fileUpload: Multer;
  private authenticationMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  private rateLimiters: RateLimitMiddlewares;

  constructor(
    secrets: Secrets,
    authenticationMiddleware: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>,
    rateLimiters: RateLimitMiddlewares
  ) {
    this.router = Router();
    this.userController = new UserController(secrets, rateLimiters);
    this.authenticationMiddleware = authenticationMiddleware;
    this.rateLimiters = rateLimiters;
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
      this.rateLimiters.register,
      this.fileUpload.array("files", 6),
      (req, res, next) => {
        try {
          if (req.body.user) {
            req.body.user = JSON.parse(req.body.user);
            next();
          } else {
            res
              .status(400)
              .json(messageToErrorResponse("User info is required"));
          }
        } catch (error) {
          console.error("Error parsing user info:", error);
          res.status(400).json(messageToErrorResponse("Invalid user info"));
        }
      },
      this.userController.createUser.bind(this.userController)
    );

    this.router.post(
      "/login",
      this.rateLimiters.login,
      this.userController.loginUser.bind(this.userController)
    );
    this.router.get(
      "/user",
      this.authenticationMiddleware,
      this.rateLimiters.api,
      checkVerification,
      this.userController.getUser.bind(this.userController)
    );
    this.router.put(
      "/user",
      this.authenticationMiddleware,
      this.rateLimiters.api,
      checkVerification,
      this.fileUpload.array("files", 6),
      (req, res, next) => {
        try {
          if (req.body.user) {
            req.body.user = JSON.parse(req.body.user);
            next();
          } else {
            res
              .status(400)
              .json(messageToErrorResponse("User info is required"));
          }
        } catch (error) {
          console.error("Error parsing user info:", error);
          res.status(400).json(messageToErrorResponse("Invalid user info"));
        }
      },
      this.userController.updateUser.bind(this.userController)
    );
    this.router.put(
      "/reset-password",
      this.rateLimiters.resetPassword,
      this.userController.resetPassword.bind(this.userController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
