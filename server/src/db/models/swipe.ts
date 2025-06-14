import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user";

export class Swipe extends Model<
  InferAttributes<Swipe>,
  InferCreationAttributes<Swipe>
> {
  declare id: CreationOptional<string>;
  declare swiperId: string;
  declare swipedId: string;
  declare action: "like" | "dislike";
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initSwipeModel = (db: Sequelize): void => {
  Swipe.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      swiperId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: User,
          key: "id",
        },
      },
      swipedId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: User,
          key: "id",
        },
      },
      action: {
        type: DataTypes.ENUM("like", "dislike"),
        allowNull: false,
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
      modelName: "Swipe",
      tableName: "swipes",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_swipes_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
