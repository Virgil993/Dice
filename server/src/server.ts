import dotenv from "dotenv";
import { createApp } from "./app";
import http from "http";
import { RDSAuthManager } from "./db/rdsAuth";
import { loadSecrets } from "./config/secrets";

dotenv.config();

async function startServer() {
  // Initialize the database connection and models
  const secrets = await loadSecrets();

  const PORT = process.env.PORT || 3000;
  const app = createApp(secrets);
  const server = http.createServer(app);

  const rdsAuthManager = new RDSAuthManager();
  await rdsAuthManager.initialize();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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
}

startServer();
