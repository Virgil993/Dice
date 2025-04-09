import { Model } from "sequelize";

export class UserGamesModel extends Model {
  userId!: number;
  gameId!: number;
}
