import dotenv from "dotenv";
import app from "./app";
import http from "http";
import { RDSAuthManager } from "./db/rdsAuth";

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer() {
  // Initialize the database connection and models
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
