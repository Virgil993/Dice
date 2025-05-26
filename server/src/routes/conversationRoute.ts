import { ConversationController } from "@/controllers/conversationController";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { checkVerification } from "@/middlewares/verification";
import { Request, Response, NextFunction, Router } from "express";

export class ConversationRoute {
  private router: Router;
  private conversationController: ConversationController;
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
    this.conversationController = new ConversationController();
    this.rateLimiters = rateLimiters;
    this.authenticationMiddleware = authenticationMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get(
      "/",
      this.authenticationMiddleware,
      this.rateLimiters.api,
      checkVerification,
      this.conversationController.getConversations.bind(
        this.conversationController
      )
    );
    this.router.delete(
      "/:id",
      this.authenticationMiddleware,
      this.rateLimiters.api,
      checkVerification,
      this.conversationController.deleteConversation.bind(
        this.conversationController
      )
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
