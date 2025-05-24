import { UserGame } from "@/db/models/userGame";

export class UserGameRepository {
  public static async getUserGames(userId: string): Promise<UserGame[] | null> {
    try {
      const userGames = await UserGame.findAll({
        where: { userId },
      });
      if (userGames.length === 0) {
        return null;
      }
      return userGames;
    } catch (error) {
      console.error("Error fetching user games:", error);
      throw error;
    }
  }

  public static async addUserGame(
    userId: string,
    gameId: string
  ): Promise<UserGame> {
    try {
      const userGame = await UserGame.create({
        userId,
        gameId,
      });
      return userGame;
    } catch (error) {
      console.error("Error adding user game:", error);
      throw error;
    }
  }

  public static async removeUserGame(
    userId: string,
    gameId: string
  ): Promise<void> {
    try {
      await UserGame.destroy({
        where: {
          userId,
          gameId,
        },
      });
    } catch (error) {
      console.error("Error removing user game:", error);
      throw error;
    }
  }
}
