import { Model } from "sequelize";

export class ActiveSessionModel extends Model {
  userId!: number;
  token!: string;
}
