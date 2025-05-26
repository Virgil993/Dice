import { MessageController } from "@/controllers/messageController";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { checkVerification } from "@/middlewares/verification";
import { Request, Response, NextFunction, Router } from "express";

export class MessageRoute {
  private router: Router;
  private messageController: MessageController;
  private rateLimiters: RateLimitMiddlewares;
  private authenticationMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  constructor(
    authenticationMiddleware: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>,
    rateLimiters: RateLimitMiddlewares
  ) {
    this.router = Router();
    this.messageController = new MessageController();
    this.rateLimiters = rateLimiters;
    this.authenticationMiddleware = authenticationMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get(
      "/:id",
      this.authenticationMiddleware,
      this.rateLimiters.api,
      checkVerification,
      this.messageController.getMessages.bind(this.messageController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
