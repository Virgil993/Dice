import { Game } from "@/db/models/game";

export class GameRepository {
  public static async getGames(): Promise<Game[]> {
    try {
      const games = await Game.findAll();
      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error;
    }
  }

  public static async getGamesByIds(gameIds: string[]): Promise<Game[]> {
    try {
      const games = await Game.findAll({
        where: {
          id: gameIds,
        },
      });
      return games;
    } catch (error) {
      console.error("Error fetching games by IDs:", error);
      throw error;
    }
  }
}
