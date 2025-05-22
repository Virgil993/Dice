import { Secrets } from "@/config/secrets";
import { EmailController } from "@/controllers/emailController";
import { NextFunction, Request, Response, Router } from "express";

export class EmailRoutes {
  private router: Router;
  private emailController: EmailController;
  private authenticationMiddleware: (
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
    ) => Promise<void>
  ) {
    this.router = Router();
    this.emailController = new EmailController(secrets);
    this.authenticationMiddleware = authenticationMiddleware;

    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post(
      "/send-verify-email",
      this.authenticationMiddleware,
      this.emailController.sendVerificationEmail.bind(this.emailController)
    );

    this.router.post(
      "/verify-email",
      this.authenticationMiddleware,
      this.emailController.verifyEmail.bind(this.emailController)
    );

    this.router.post(
      "/send-reset-password-email",
      this.emailController.sendPasswordResetEmail.bind(this.emailController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
