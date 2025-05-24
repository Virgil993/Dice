import { GameController } from "@/controllers/gameController";
import { RateLimitMiddlewares } from "@/middlewares/rateLimit";
import { NextFunction, Request, Response, Router } from "express";

export class GameRoute {
  private router: Router;
  private gameController: GameController;
  private rateLimiters: RateLimitMiddlewares;

  constructor(rateLimiters: RateLimitMiddlewares) {
    this.router = Router();
    this.gameController = new GameController();
    this.rateLimiters = rateLimiters;

    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get(
      "/all",
      this.rateLimiters.api,
      this.gameController.getGames.bind(this.gameController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
