import { Service, Inject } from "typedi";
import { Connection } from "typeorm";
import { Player } from "../models";

@Service()
export default class PlayerService {
  constructor(
    @Inject("db.connection") private connection: Connection
  ) {}

  public async find(id: number): Promise<Player | undefined> {
    return await this.connection.getRepository(Player).findOne(id, { relations: ["games", "games.players"]});
  }

  public async findAll(): Promise<Player[]> {
    return await this.connection.getRepository(Player).find({ relations: ["games", "games.players", "games.moves"] });
  }

  public async findOrCreate(name: string): Promise<Player> {
    const userRepository = this.connection.getRepository(Player);
    let user = await userRepository.findOne({ name }, { relations: ["games", "games.players"] });

    if (user) {
      return user;
    }

    user = new Player();
    user.name = name;
    return await userRepository.save(user); 
  }
}
