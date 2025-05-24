import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user";

export class EmailVerificationSession extends Model<
  InferAttributes<EmailVerificationSession>,
  InferCreationAttributes<EmailVerificationSession>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare token: string;
  declare tokenUuid: CreationOptional<string>;
  declare verifiedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initEmailVerificationSessionModel = (db: Sequelize): void => {
  EmailVerificationSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: User,
          key: "id",
        },
      },
      token: {
        type: DataTypes.STRING(512),
        allowNull: false,
        unique: true,
      },
      tokenUuid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize: db,
      tableName: "email_verification_sessions",
      modelName: "EmailVerificationSession",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_email_verification_sessions_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
