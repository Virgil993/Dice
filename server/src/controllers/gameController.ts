import { GameService } from "@/services/gameService";
import { Request, Response, NextFunction } from "express";

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  public async getGames(
    _: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const games = await this.gameService.getGames();
      res.status(200).json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      next(error);
    }
  }
}
