import { UserGame } from "@/db/models/userGame";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export class UserGameRepository {
  public static async getUserGames(userId: string): Promise<UserGame[] | null> {
    try {
      uuidSchema.parse(userId); // Validate userId format
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
      uuidSchema.parse(userId); // Validate userId format
      uuidSchema.parse(gameId); // Validate gameId format
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
      uuidSchema.parse(userId); // Validate userId format
      uuidSchema.parse(gameId); // Validate gameId format
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

  public static async deleteUserGamesByUserId(userId: string): Promise<void> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      await UserGame.destroy({
        where: { userId },
      });
    } catch (error) {
      console.error("Error deleting user games by user ID:", error);
      throw error;
    }
  }
}
