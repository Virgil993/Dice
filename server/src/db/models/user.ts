import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare password: string;
  declare birthday: Date;
  declare gender: Gender;
  declare totpSecret: CreationOptional<string | null>;
  declare backupCodes: CreationOptional<string | null>;
  declare totpEnabled: CreationOptional<boolean>;
  declare description: CreationOptional<string>;
  declare verified: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export const initUserModel = (db: Sequelize): void => {
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
      totpSecret: {
        type: DataTypes.STRING(512),
        allowNull: true,
        defaultValue: null,
      },
      backupCodes: {
        type: DataTypes.STRING(512),
        allowNull: true,
        defaultValue: null,
      },
      totpEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      },
    },
    {
      sequelize: db,
      modelName: "User",
      tableName: "users",
      paranoid: true, // Enable soft deletes
      underscored: true,
      indexes: [
        {
          name: "idx_users_deleted_a",
          fields: ["deleted_at"],
        },
        {
          fields: ["email", "deleted_at"],
          unique: true,
        },
      ],
    }
  );
};
