import dotenv from "dotenv";
import { createApp } from "./app";
import http from "http";
import { RDSAuthManager } from "./db/rdsAuth";
import { loadSecrets } from "./config/secrets";
import { RedisInstance } from "./config/redis";
import { initializeWebSocket } from "./websockets/initialize";

dotenv.config();

async function startServer() {
  // Initialize the database connection and models
  const secrets = await loadSecrets();

  const redisClient = new RedisInstance(secrets).getClient();
  const PORT = process.env.PORT || 3000;
  const app = createApp(secrets, redisClient);
  const server = http.createServer(app);
  const wss = initializeWebSocket(server, secrets, redisClient);

  const rdsAuthManager = new RDSAuthManager();
  await rdsAuthManager.initialize();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`websocket available on ws://localhost:${PORT}/ws`);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    wss.clients.forEach((ws) => {
      ws.close(1001, "Server shutting down");
    });
    server.close(() => {
      console.log("Process terminated");
    });
  });
}

startServer();
