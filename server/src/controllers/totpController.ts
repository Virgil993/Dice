import { Secrets } from "@/config/secrets";
import { Status } from "@/dtos/request";
import { TotpService } from "@/services/totpService";
import { Request, Response, NextFunction } from "express";

export class TotpController {
  private totpService: TotpService;

  constructor(secrets: Secrets) {
    this.totpService = new TotpService(secrets);
  }

  public async generateTotp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const totp = await this.totpService.generateSecret(userId);
      res.status(200).json(totp);
    } catch (error) {
      console.error("Error generating TOTP:", error);
      next(error);
    }
  }

  public async verifyTotp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const code = req.body.code;
      const userAgent = req.headers["user-agent"] as string;
      const response = await this.totpService.verifyTotpCode(
        userId,
        code,
        userAgent
      );
      res.status(200).json(response);
    } catch (error) {
      console.error("Error verifying TOTP:", error);
      next(error);
    }
  }

  public async enableTotp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const code = req.body.code;
      const userAgent = req.headers["user-agent"] as string;
      const response = await this.totpService.enableTotp(
        userId,
        code,
        userAgent
      );
      res.status(200).json(response);
    } catch (error) {
      console.error("Error enabling TOTP:", error);
      next(error);
    }
  }

  public async disableTotp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      await this.totpService.disableTotp(userId);
      res.status(200).json({
        status: Status.SUCCESS,
      });
    } catch (error) {
      console.error("Error disabling TOTP:", error);
      next(error);
    }
  }

  public async useBackupCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const code = req.body.code;
      const userAgent = req.headers["user-agent"] as string;
      const response = await this.totpService.useBackupCode(
        userId,
        code,
        userAgent
      );
      res.status(200).json(response);
    } catch (error) {
      console.error("Error using backup code:", error);
      next(error);
    }
  }
}
