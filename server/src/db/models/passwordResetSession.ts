import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class PasswordResetSession extends Model<
  InferAttributes<PasswordResetSession>,
  InferCreationAttributes<PasswordResetSession>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare token: string;
  declare tokenUuid: CreationOptional<string>;
  declare usedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initPasswordResetSessionModel = (db: Sequelize): void => {
  PasswordResetSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
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
      usedAt: {
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
      tableName: "password_reset_sessions",
      modelName: "PasswordResetSession",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_password_reset_sessions_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
