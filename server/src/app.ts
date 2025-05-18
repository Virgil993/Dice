import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { UserRoutes } from "./routes/userRoute";

const userRoutes = new UserRoutes();

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/user", userRoutes.getRouter());

// 404 handler
app.use((_: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
