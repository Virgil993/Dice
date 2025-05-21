import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ActiveSession extends Model<
  InferAttributes<ActiveSession>,
  InferCreationAttributes<ActiveSession>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare token: string;
  declare tokenUuid: CreationOptional<string>;
  declare userAgent: string;
  declare lastUsedAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initActiveSessionModel = (db: Sequelize): void => {
  ActiveSession.init(
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
      userAgent: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      tokenUuid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
      tableName: "active_sessions",
      modelName: "ActiveSession",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_active_sessions_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
