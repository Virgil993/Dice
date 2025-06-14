import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user";

export class UserPhoto extends Model<
  InferAttributes<UserPhoto>,
  InferCreationAttributes<UserPhoto>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare position: number;
  declare originalFilename: string;
  declare mimeType: string;
  declare sizeBytes: number;
  declare fileHash: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initUserPhotoModel = (db: Sequelize): void => {
  UserPhoto.init(
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
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      originalFilename: {
        type: DataTypes.STRING(255),
      },
      mimeType: {
        type: DataTypes.STRING(100),
      },
      sizeBytes: {
        type: DataTypes.INTEGER,
      },
      fileHash: {
        type: DataTypes.STRING(512),
        allowNull: false,
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
      },
    },
    {
      sequelize: db,
      modelName: "UserPhoto",
      tableName: "user_photos",
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: "idx_user_photos_deleted_at",
          fields: ["deleted_at"],
        },
        {
          fields: ["user_id", "position", "deleted_at"],
          unique: true,
        },
      ],
    }
  );
};
