import { Model } from "sequelize";

export class VerifyAccountSessionModel extends Model {
  userId!: number;
  token!: string;
  expiresAt!: Date;
  date!: Date;
}
