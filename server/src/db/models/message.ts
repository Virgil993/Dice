import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user";
import { Conversation } from "./conversation";

export class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<string>;
  declare conversationId: string;
  declare senderId: string;
  declare content: string;
  declare isRead: CreationOptional<boolean>;
  declare readAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initMessageModel = (db: Sequelize): void => {
  Message.init(
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
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: User,
          key: "id",
        },
      },
      conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Conversation,
          key: "id",
        },
      },
      content: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
      modelName: "Message",
      tableName: "messages",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_messages_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );
};
