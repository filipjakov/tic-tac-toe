import jwt from 'jsonwebtoken';
import { Service } from "typedi";
import config from "../config";
import { PlayerService } from "./player.service";
import { Player } from '../models';
import Logger from '../loaders/logger';

@Service()
export class AuthService {
  constructor(
    private playerService: PlayerService
  ) {}

  public async signUp({ name }: { name: string }): Promise<{player: Player; token: string}> {
    const player = await this.playerService.findOrCreate(name);

    // Generate token
    const token = jwt.sign({
      _id: player.id,
      name: player.name,
    }, config.jwtSecret);

    Logger.warn(`User ${player.name} signed up! -> check token in the response!`)

    return { player, token };
  }

  public async findUser(token: string): Promise<Player | null> {
    const metadata = jwt.decode(token, { json: true });
    if(!metadata) {
      Logger.warn(`Could not parse token!`)
      return null;
    }
    const user = await this.playerService.find(metadata._id);
  
    if(!user) {
      Logger.warn(`Can't find user for provided id!`)
      return null;
    }

    return user;
  }
}
