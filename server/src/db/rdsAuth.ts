import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_USER,
} from "@/config/envHandler";
import { Signer } from "@aws-sdk/rds-signer";
import { Sequelize } from "sequelize";
import { initUserModel } from "./models/user";
import mysql from "mysql2";
import { initActiveSessionModel } from "./models/activeSession";
import { initPasswordResetSessionModel } from "./models/passwordResetSession";
import { initEmailVerificationSessionModel } from "./models/emailVerificationSession";

export class RDSAuthManager {
  private sequelize: Sequelize | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes (tokens expire after 15 minutes)

  private readonly signer: Signer;

  constructor() {
    this.signer = new Signer({
      region: AWS_REGION,
      hostname: DB_HOST,
      port: Number(DB_PORT),
      username: DB_USER,

      // This part is required only for local development
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private async generateRDSAuthToken(): Promise<string> {
    const token = await this.signer.getAuthToken();
    return token;
  }

  private async refreshConnection() {
    try {
      const token = await this.generateRDSAuthToken();
      if (this.sequelize) {
        await this.sequelize.close();
      }

      this.sequelize = new Sequelize({
        dialect: "mysql",
        dialectModule: mysql,
        host: DB_HOST,
        port: Number(DB_PORT),
        username: DB_USER,
        password: token,
        database: DB_NAME,
        dialectOptions: {
          ssl: "Amazon RDS",
        },
      });

      await this.sequelize.authenticate();
      this.initTables(this.sequelize);

      console.log("Database connection established successfully.");
    } catch (error) {
      console.error("Error establishing database connection:", error);
      throw error;
    }
  }

  public async getSequelize(): Promise<Sequelize> {
    if (this.sequelize) {
      return this.sequelize;
    } else {
      throw new Error(
        "Database connection not established. Call initialize() first."
      );
    }
  }

  public async shutdown(): Promise<void> {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.sequelize) {
      await this.sequelize.close();
      this.sequelize = null;
    }
  }

  public async initialize(): Promise<Sequelize> {
    try {
      // initial connection setup
      await this.refreshConnection();

      // set up a timer to refresh the connection every 10 minutes
      this.refreshTimer = setInterval(async () => {
        try {
          await this.refreshConnection();
        } catch (error) {
          console.error("Error refreshing database connection:", error);
        }
      }, this.TOKEN_REFRESH_INTERVAL);

      if (this.sequelize) {
        console.log("Database connection established and refresh timer set.");
        return this.sequelize;
      }
      throw new Error("Failed to establish database connection.");
    } catch (error) {
      console.error("Error initializing database connection:", error);
      throw error;
    }
  }

  private initTables(db: Sequelize): void {
    initUserModel(db);
    initActiveSessionModel(db);
    initPasswordResetSessionModel(db);
    initEmailVerificationSessionModel(db);
  }
}
