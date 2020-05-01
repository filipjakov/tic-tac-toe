import { Inject, Service } from "typedi";
import { Connection } from "typeorm";
import { Game, Player } from "../models";
import { PlayerService } from "./player.service";

@Service()
export default class BotService {
  private NAME = 'bot';

  constructor(
    @Inject("db.connection") private connection: Connection,
    public playerService: PlayerService
  ) {}

  public async findOrCreateBot(): Promise<Player> {
    const userRepository = this.connection.getRepository(Player);
    let user = await userRepository.findOne({ name: this.NAME });

    if (user) {
      return user;
    }

    user = new Player();
    user.name = this.NAME;
    return await userRepository.save(user); 
  }

  public async findOptimalMove(gameId: number): Promise<number> {
    const bot = await this.connection.getRepository(Player).findOne({ name: this.NAME }, { relations: ["games", "games.moves"]});

    const currentMoves = (bot?.games.find(({ id }) => gameId === id) as Game).moves.map(({ type }) => type);
    const availableMoves = Array.from({ length: 9 }, (_, i) => i).filter(i => !currentMoves.includes(i));
    const optimalMove = Math.floor(Math.random() * availableMoves.length); // TODO: better heuristics

    return availableMoves[optimalMove];
  }
}
