import { APP_URL } from "@/config/envHandler";
import { Secrets } from "@/config/secrets";
import { EmailVerificationSession } from "@/db/models/emailVerificationSession";
import { PasswordResetSession } from "@/db/models/passwordResetSession";
import { EmailVerificationSessionRepository } from "@/repositories/emailVerificationSessionRepository";
import { PasswordResetSessionRepository } from "@/repositories/passwordResetSessionRepository";
import { UserRepository } from "@/repositories/userRepository";
import { UserError } from "@/types/errors";
import {
  compareHashes,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  hashString,
  verifyEmailVerificationToken,
} from "@/utils/auth";
import {
  getPasswordResetEmail,
  getTransporter,
  getVerificationEmail,
} from "@/utils/email";
import { Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter;
  private secrets: Secrets;

  constructor(secrets: Secrets) {
    this.secrets = secrets;
    this.transporter = getTransporter(secrets);
  }

  public async sendVerificationEmail(
    email: string,
    userId: string
  ): Promise<void> {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.verified) {
      throw new Error("User already verified");
    }

    const token = await generateEmailVerificationToken(
      userId,
      email,
      this.secrets.email_verification_token_secret
    );

    const hashedToken = await hashString(token.token);
    const emailVerificationSession = EmailVerificationSession.build({
      userId: userId,
      token: hashedToken,
      tokenUuid: token.tokenUUID,
    });

    await EmailVerificationSessionRepository.createEmailVerificationSession(
      emailVerificationSession
    );
    const safeToken = encodeURIComponent(token.token);
    const emailContent = getVerificationEmail(userId, safeToken, APP_URL);

    const mailOptions = {
      from: this.secrets.email_verification_username,
      to: email,
      subject: "Email Verification Dice",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }

  public async verifyEmail(token: string, userId: string): Promise<void> {
    const payload = await verifyEmailVerificationToken(
      token,
      this.secrets.email_verification_token_secret
    );
    const emailVerificationSession =
      await EmailVerificationSessionRepository.getEmailVerificationSessionByTokenUUID(
        payload.tokenUUID
      );

    if (!emailVerificationSession) {
      throw new UserError("Invalid or expired verification token", 401);
    }

    if (emailVerificationSession.userId !== userId) {
      throw new UserError("Invalid verification token", 401);
    }

    if (emailVerificationSession.verifiedAt) {
      throw new UserError("Token already used", 409);
    }

    const isTokenValid = await compareHashes(
      token,
      emailVerificationSession.token
    );
    if (!isTokenValid) {
      throw new UserError("Invalid verification token", 401);
    }

    await EmailVerificationSessionRepository.setEmailVerificationSessionUsed(
      emailVerificationSession
    );

    await UserRepository.setUserVerified(userId);
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      return; // Do not disclose if the email is registered
    }

    const token = await generatePasswordResetToken(
      user.id,
      email,
      this.secrets.password_reset_session_token_secret
    );

    const hashedToken = await hashString(token.token);
    const passwordResetSession = PasswordResetSession.build({
      userId: user.id,
      token: hashedToken,
      tokenUuid: token.tokenUUID,
    });

    await PasswordResetSessionRepository.createPasswordResetSession(
      passwordResetSession
    );

    const safeToken = encodeURIComponent(token.token);
    const emailContent = getPasswordResetEmail(user.id, safeToken, APP_URL);

    const mailOptions = {
      from: this.secrets.email_verification_username,
      to: email,
      subject: "Password Reset Dice",
      html: emailContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
