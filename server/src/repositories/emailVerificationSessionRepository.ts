import { EmailVerificationSession } from "@/db/models/emailVerificationSession";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export class EmailVerificationSessionRepository {
  public static async createEmailVerificationSession(
    session: EmailVerificationSession
  ): Promise<EmailVerificationSession> {
    try {
      const newSession = await session.save();
      return newSession;
    } catch (error) {
      console.error("Error creating email verification session:", error);
      throw error;
    }
  }
  public static async getEmailVerificationSessionByTokenUUID(
    tokenUUID: string
  ): Promise<EmailVerificationSession | null> {
    try {
      uuidSchema.parse(tokenUUID); // Validate UUID format
      const session = await EmailVerificationSession.findOne({
        where: { tokenUuid: tokenUUID },
      });
      return session;
    } catch (error) {
      console.error("Error fetching email verification session by ID:", error);
      throw error;
    }
  }

  public static async setEmailVerificationSessionUsed(
    session: EmailVerificationSession
  ): Promise<EmailVerificationSession> {
    try {
      session.verifiedAt = new Date();
      const updatedSession = await session.save();
      return updatedSession;
    } catch (error) {
      console.error("Error updating email verification session:", error);
      throw error;
    }
  }
}
