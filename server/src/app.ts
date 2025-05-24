import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { UserRoutes } from "./routes/userRoute";
import { Secrets } from "./config/secrets";
import { errorHandler } from "./middlewares/errorHandler";
import { API_URL } from "./config/envHandler";
import { createAuthMiddleware } from "./middlewares/auth";
import { EmailRoutes } from "./routes/emailRoute";
import { TotpRoutes } from "./routes/totpRoute";
import { createTotpTokenMiddleware } from "./middlewares/totp";
import { RedisInstance } from "./config/redis";
import { createRateLimiters } from "./middlewares/rateLimit";
import { GameRoute } from "./routes/gameRoute";

export function createApp(secrets: Secrets): Express {
  const authenticationMiddleware = createAuthMiddleware(secrets);
  const totpTokenMiddleware = createTotpTokenMiddleware(secrets);
  const redisClient = new RedisInstance(secrets).getClient();
  const rateLimiters = createRateLimiters(redisClient);
  const userRoutes = new UserRoutes(
    secrets,
    authenticationMiddleware,
    rateLimiters
  );
  const emailRoutes = new EmailRoutes(
    secrets,
    authenticationMiddleware,
    rateLimiters
  );
  const totpRoutes = new TotpRoutes(
    secrets,
    authenticationMiddleware,
    totpTokenMiddleware,
    rateLimiters
  );
  const gameRoutes = new GameRoute(rateLimiters);

  const app: Express = express();

  // Middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", API_URL],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Routes
  app.use("/api/users", userRoutes.getRouter());
  app.use("/api/email", emailRoutes.getRouter());
  app.use("/api/totp", totpRoutes.getRouter());
  app.use("/api/games", gameRoutes.getRouter());

  // 404 handler
  app.use((_: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorHandler);

  return app;
}
