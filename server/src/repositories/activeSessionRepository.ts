import { ActiveSession } from "@/db/models/activeSession";
import { z } from "zod";
const uuidSchema = z.string().uuid();

export class ActiveSessionRepository {
  public static async createActiveSession(
    session: ActiveSession
  ): Promise<ActiveSession> {
    try {
      const newSession = await session.save();
      return newSession;
    } catch (error) {
      console.error("Error creating active session:", error);
      throw error;
    }
  }

  public static async getActiveSessionByTokenUUID(
    tokenUUID: string
  ): Promise<ActiveSession | null> {
    try {
      uuidSchema.parse(tokenUUID); // Validate UUID format
      const session = await ActiveSession.findOne({
        where: { tokenUuid: tokenUUID },
      });
      return session;
    } catch (error) {
      console.error("Error fetching active session by ID:", error);
      throw error;
    }
  }

  public static async deleteActiveSessionByUserId(
    userId: string
  ): Promise<void> {
    try {
      uuidSchema.parse(userId); // Validate userId format
      await ActiveSession.destroy({
        where: { userId: userId },
      });
    } catch (error) {
      console.error("Error deleting active session by user ID:", error);
      throw error;
    }
  }
}
