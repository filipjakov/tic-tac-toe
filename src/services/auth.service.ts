import jwt from 'jsonwebtoken';
import Container, { Service } from "typedi";
import config from "../config";
import PlayerService from "./player.service";
import { Player } from '../models';

@Service()
export default class AuthService {
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

    return { player, token };
  }

  public async findUser(token: string): Promise<Player | null> {
    const metadata = jwt.decode(token, { json: true });
    if(!metadata) {
      return null;
    }
    const user = await this.playerService.find(metadata._id);
  
    if(!user) {
      return null;
    }

    return user;
  }
}
