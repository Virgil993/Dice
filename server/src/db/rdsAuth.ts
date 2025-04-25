import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_USER,
  ENVIRONMENT,
} from "@/config/envHandler";
import { Signer } from "@aws-sdk/rds-signer";
import { DataTypes, Sequelize } from "sequelize";
import { User } from "./models/user";
import mysql from "mysql2";

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

      console.log(`Refreshing database connection with new token: ${token}`);

      this.sequelize = new Sequelize({
        dialect: "mysql",
        dialectModule: mysql,
        host: DB_HOST,
        port: Number(DB_PORT),
        username: DB_USER,
        password: token,
        database: DB_NAME,
        dialectOptions: {
          ssl:
            ENVIRONMENT === "dev"
              ? "Amazon RDS"
              : {
                  require: true,
                  rejectUnauthorized: false,
                },
        },
        logging: false,
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
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(512),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(512),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(512),
          allowNull: false,
        },
        birthday: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        gender: {
          type: DataTypes.ENUM("male", "female"),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
          field: "deleted_at",
        },
      },
      {
        sequelize: db,
        modelName: "User",
        tableName: "users",
        paranoid: true, // Enable soft deletes
        indexes: [
          {
            name: "idx_users_deleted_a",
            fields: ["deleted_at"],
          },
          {
            name: "idx_users_email_deleted_at",
            fields: ["email", "deleted_at"],
            unique: true,
          },
        ],
      }
    );
  }
}
