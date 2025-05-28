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
import { createRateLimiters } from "./middlewares/rateLimit";
import { GameRoute } from "./routes/gameRoute";
import { SwipeRoute } from "./routes/swipeRoute";
import { ConversationRoute } from "./routes/conversationRoute";
import { MessageRoute } from "./routes/messageRoute";
import { Status } from "./dtos/request";
import { messageToErrorResponse } from "./utils/helper";
import Redis from "ioredis";

export function createApp(secrets: Secrets, redisClient: Redis): Express {
  const authenticationMiddleware = createAuthMiddleware(secrets);
  const totpTokenMiddleware = createTotpTokenMiddleware(secrets);
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
  const swipeRoutes = new SwipeRoute(authenticationMiddleware, rateLimiters);
  const conversationRoutes = new ConversationRoute(
    authenticationMiddleware,
    rateLimiters
  );
  const messageRoutes = new MessageRoute(
    authenticationMiddleware,
    rateLimiters
  );

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
  app.get("/api/health", rateLimiters.api, (_: Request, res: Response) => {
    res.status(200).json({ status: Status.SUCCESS });
  });

  // Routes
  app.use("/api/users", userRoutes.getRouter());
  app.use("/api/email", emailRoutes.getRouter());
  app.use("/api/totp", totpRoutes.getRouter());
  app.use("/api/games", gameRoutes.getRouter());
  app.use("/api/swipes", swipeRoutes.getRouter());
  app.use("/api/conversations", conversationRoutes.getRouter());
  app.use("/api/messages", messageRoutes.getRouter());

  app.use(errorHandler);

  // 404 handler
  app.use((_: Request, res: Response) => {
    res.status(404).json(messageToErrorResponse("Route not found"));
  });

  return app;
}
