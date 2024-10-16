import { Model } from "sequelize";

export class UserPhotosModel extends Model {
  userId!: number;
  isPrimary!: boolean;
  uploadedAt!: Date;
  date!: Date;
}
