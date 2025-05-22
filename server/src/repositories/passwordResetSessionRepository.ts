import { PasswordResetSession } from "@/db/models/passwordResetSession";

export class PasswordResetSessionRepository {
  public static async createPasswordResetSession(
    session: PasswordResetSession
  ): Promise<PasswordResetSession> {
    try {
      const newSession = await session.save();
      return newSession;
    } catch (error) {
      console.error("Error creating password reset session:", error);
      throw error;
    }
  }

  public static async getPasswordResetSessionByTokenUUID(
    tokenUUID: string
  ): Promise<PasswordResetSession | null> {
    try {
      const session = await PasswordResetSession.findOne({
        where: { tokenUuid: tokenUUID },
      });
      return session;
    } catch (error) {
      console.error("Error fetching password reset session by ID:", error);
      throw error;
    }
  }
}
