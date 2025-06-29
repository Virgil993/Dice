import { PasswordResetSession } from "@/db/models/passwordResetSession";
import { z } from "zod";

const uuidSchema = z.string().uuid();

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
      uuidSchema.parse(tokenUUID); // Validate UUID format
      const session = await PasswordResetSession.findOne({
        where: { tokenUuid: tokenUUID },
      });
      return session;
    } catch (error) {
      console.error("Error fetching password reset session by ID:", error);
      throw error;
    }
  }

  public static async setPasswordResetSessionUsed(
    tokenUUID: string
  ): Promise<void> {
    try {
      uuidSchema.parse(tokenUUID); // Validate UUID format
      const session = await PasswordResetSession.findOne({
        where: { tokenUuid: tokenUUID },
      });
      if (session) {
        session.usedAt = new Date();
        await session.save();
      }
    } catch (error) {
      console.error("Error setting password reset session as used:", error);
      throw error;
    }
  }
}
