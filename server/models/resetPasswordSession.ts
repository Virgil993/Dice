import { Model } from "sequelize";

export class ResetPasswordSessionModel extends Model {
  userId!: number;
  token!: string;
}
