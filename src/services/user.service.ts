import { Service, Inject } from "typedi";
import { Connection } from "typeorm";
import { User } from "../models";

@Service()
export default class UserService {
  constructor(
    @Inject("db.connection") private connection: Connection
  ) {}

  public async findOrCreate(name: string): Promise<User> {
    const userRepository = this.connection.getRepository(User);
    let user = await userRepository.findOne({ name });

    if (user) {
      return user;
    }

    user = new User();
    user.name = name;
    return await userRepository.save(user); 
  }

  public async find(id: string): Promise<User | undefined> {
    return this.connection.getRepository(User).findOne(id);
  }
}
