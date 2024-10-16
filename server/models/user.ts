import { Model } from "sequelize";

export class UserModel extends Model {
  name!: string;
  email!: string;
  password!: string;
  birthday!: Date;
  gender!: string;
  description!: string;
  verified!: boolean;
}
