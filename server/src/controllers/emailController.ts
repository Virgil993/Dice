import { Secrets } from "@/config/secrets";
import { EmailService } from "@/services/emailService";
import { Request, Response, NextFunction } from "express";

export class EmailController {
  private emailService: EmailService;

  constructor(secrets: Secrets) {
    this.emailService = new EmailService(secrets);
  }

  public async sendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userInfo = req.user!;
    try {
      await this.emailService.sendVerificationEmail(
        userInfo.email,
        userInfo.userId
      );
      res.status(200).json({
        status: "success",
        message: "Verification email sent",
      });
      return;
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      next(error);
      return;
    }
  }

  public async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userInfo = req.user!;
    const { userId, token } = req.query;
    if (!token || !userId) {
      res.status(400).json({
        status: "error",
        message: "Token and userId are required",
      });
      return;
    }
    if (userInfo.userId !== userId) {
      res.status(400).json({
        status: "error",
        message: "UserId does not match",
      });
      return;
    }

    try {
      await this.emailService.verifyEmail(token.toString(), userId);
      res.status(200).json({
        status: "success",
        message: "Email verified successfully",
      });
      return;
    } catch (error: any) {
      console.error("Error verifying email:", error);
      next(error);
      return;
    }
  }

  public async sendPasswordResetEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const email = req.body.email;
    if (!email) {
      res.status(400).json({
        status: "error",
        message: "Email is required",
      });
      return;
    }
    try {
      await this.emailService.sendPasswordResetEmail(email);
      res.status(200).json({
        status: "success",
        message: "Password reset email sent",
      });
      return;
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      next(error);
      return;
    }
  }
}
