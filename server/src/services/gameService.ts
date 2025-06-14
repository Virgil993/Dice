import { GetGamesResponse, Status } from "@/dtos/request";
import { GameRepository } from "@/repositories/gameRepository";
import { gameToDTO } from "@/utils/helper";

export class GameService {
  constructor() {}

  public async getGames(): Promise<GetGamesResponse> {
    const games = await GameRepository.getGames();

    return {
      status: Status.SUCCESS,
      games: games.map((game) => gameToDTO(game)),
    };
  }
}
