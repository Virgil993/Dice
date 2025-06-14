import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user";
import { Game } from "./game";

export class UserGame extends Model<
  InferAttributes<UserGame>,
  InferCreationAttributes<UserGame>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare gameId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initUserGameModel = (db: Sequelize): void => {
  UserGame.init(
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
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Game,
          key: "id",
        },
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
      modelName: "UserGame",
      tableName: "user_games",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_user_games_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
