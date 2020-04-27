import jwt from 'jsonwebtoken';
import { Service } from "typedi";
import config from "../config";
import UserService from "./user.service";
import { User } from '../models';

@Service()
export default class AuthService {
  constructor(
    private userService: UserService
  ) {}

  public async signUp({ name }: { name: string }): Promise<{user: User; token: string}> {
    const user = await this.userService.findOrCreate(name);
    
    // Generate token
    const token = jwt.sign({
      _id: user.id,
      name: user.name,
    }, config.jwtSecret);
    
    return { user, token };
  }
}
