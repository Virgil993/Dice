import { ActiveSession } from "@/db/models/activeSession";

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

  public static async getActiveSessionByToken(
    token: string
  ): Promise<ActiveSession | null> {
    try {
      const session = await ActiveSession.findOne({ where: { token: token } });
      return session;
    } catch (error) {
      console.error("Error fetching active session by ID:", error);
      throw error;
    }
  }
}
