import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Game extends Model<
  InferAttributes<Game>,
  InferCreationAttributes<Game>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initGameModel = (db: Sequelize): void => {
  Game.init(
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
      description: {
        type: DataTypes.TEXT,
        defaultValue: "",
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
      modelName: "Game",
      tableName: "games",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_games_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
