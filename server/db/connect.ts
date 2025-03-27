import { DataTypes, Sequelize } from "sequelize";
import pg from "pg";
import { UserModel } from "../models/user";
import { ActiveSessionModel } from "../models/activeSession";
import { ResetPasswordSessionModel } from "../models/resetPasswordSession";
import { VerifyAccountSessionModel } from "../models/veryifyAccountSession";
import { UserPhotosModel } from "../models/userPhotos";
import { UserGamesModel } from "../models/userGames";
import { GameModel } from "../models/game";

export function connectDb(): Sequelize {
  const sequelize = new Sequelize(process.env.POSTGRES_URL || "", {
    dialect: "postgres",
    dialectModule: pg,
    define: {
      timestamps: true, // This disables the created_at and updated_at columns
    },
    dialectOptions: {
      ssl: {
        require: true, // Use SSL with the 'require' option
      },
    },
  });
  initTables(sequelize);
  return sequelize;
}

export function initTables(db: Sequelize) {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING(512),
      email: DataTypes.STRING(512),
      password: DataTypes.STRING(512),
      birthday: DataTypes.DATE,
      gender: DataTypes.STRING(512),
      description: DataTypes.STRING(2048),
      verified: DataTypes.BOOLEAN,
    },
    {
      sequelize: db,
      modelName: "UserModel",
      tableName: "users",
    }
  );

  ActiveSessionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: DataTypes.STRING(512),
      userId: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "ActiveSessionModel",
      tableName: "active_sessions",
    }
  );

  ResetPasswordSessionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: DataTypes.STRING(512),
      userId: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "ResetPasswordSessionModel",
      tableName: "reset_password_sessions",
    }
  );

  VerifyAccountSessionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: DataTypes.STRING(512),
      userId: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "VerifyAccountSessionModel",
      tableName: "verify_account_sessions",
    }
  );

  UserPhotosModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: DataTypes.UUID,
      isPrimary: DataTypes.BOOLEAN,
      photoHash: DataTypes.STRING(1024),
    },
    {
      sequelize: db,
      modelName: "UserPhotosModel",
      tableName: "user_photos",
    }
  );

  UserGamesModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: DataTypes.UUID,
      gameId: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "UserGamesModel",
      tableName: "user_games",
    }
  );

  GameModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING(512),
    },
    {
      sequelize: db,
      modelName: "GameModel",
      tableName: "games",
    }
  );
}

export async function syncDb(db: Sequelize) {
  await db.sync();
}
