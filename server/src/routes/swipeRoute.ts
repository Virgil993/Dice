import { SwipeController } from "@/controllers/swipeController";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { checkVerification } from "@/middlewares/verification";
import { Request, Response, NextFunction, Router } from "express";

export class SwipeRoute {
  private router: Router;
  private swipeController: SwipeController;
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
    this.swipeController = new SwipeController();
    this.rateLimiters = rateLimiters;
    this.authenticationMiddleware = authenticationMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post(
      "/",
      this.authenticationMiddleware,
      this.rateLimiters.api,
      checkVerification,
      this.swipeController.addSwipe.bind(this.swipeController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
