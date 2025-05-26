import { Secrets } from "@/config/secrets";
import { SendPasswordResetEmailRequest, Status } from "@/dtos/request";
import { EmailService } from "@/services/emailService";
import { messageToErrorResponse } from "@/utils/helper";
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
        status: Status.SUCCESS,
      });
      return;
    } catch (error) {
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
      res
        .status(400)
        .json(messageToErrorResponse("Token and userId are required"));
      return;
    }
    if (userInfo.userId !== userId) {
      res.status(400).json(messageToErrorResponse("UserId does not match"));
      return;
    }

    try {
      await this.emailService.verifyEmail(token.toString(), userId);
      res.status(200).json({
        status: Status.SUCCESS,
      });
      return;
    } catch (error) {
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
    const { email } = req.body as SendPasswordResetEmailRequest;
    if (!email) {
      res.status(400).json(messageToErrorResponse("Email is required"));
      return;
    }
    try {
      await this.emailService.sendPasswordResetEmail(email);
      res.status(200).json({
        status: Status.SUCCESS,
      });
      return;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      next(error);
      return;
    }
  }
}
