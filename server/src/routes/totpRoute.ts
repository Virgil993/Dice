import { Secrets } from "@/config/secrets";
import { TotpController } from "@/controllers/totpController";
import { checkTotpEnabled } from "@/middlewares/totp";
import { checkVerification } from "@/middlewares/verification";
import { NextFunction, Router, Request, Response } from "express";

export class TotpRoutes {
  private router: Router;
  private totpController: TotpController;
  private authenticationMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  private totpTokenMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  constructor(
    secrets: Secrets,
    authenticationMiddleware: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>,
    totpTokenMiddleware: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>
  ) {
    this.router = Router();
    this.totpController = new TotpController(secrets);
    this.authenticationMiddleware = authenticationMiddleware;
    this.totpTokenMiddleware = totpTokenMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post(
      "/generate-secret",
      this.authenticationMiddleware,
      checkVerification,
      this.totpController.generateTotp.bind(this.totpController)
    );

    this.router.post(
      "/verify",
      this.totpTokenMiddleware,
      checkVerification,
      checkTotpEnabled,
      this.totpController.verifyTotp.bind(this.totpController)
    );

    this.router.post(
      "/enable",
      this.authenticationMiddleware,
      checkVerification,
      this.totpController.enableTotp.bind(this.totpController)
    );

    this.router.post(
      "/disable",
      this.authenticationMiddleware,
      checkVerification,
      checkTotpEnabled,
      this.totpController.disableTotp.bind(this.totpController)
    );

    this.router.post(
      "/backup",
      this.totpTokenMiddleware,
      checkVerification,
      checkTotpEnabled,
      this.totpController.useBackupCode.bind(this.totpController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
