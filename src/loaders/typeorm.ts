import Container from "typedi";
import { createConnection } from "typeorm";
import config from "../config";
import { Game, Move, Player } from "../models";

export default async () => {
  try {
    const connection = await createConnection({
      type: 'sqlite',
      name: 'memory',
      database: ':memory:',
      logging: config.dev && ['error'],
      entities: [
        Player,
        Game,
        Move
      ],
      synchronize: config.dev
    });

    Container.set('db.connection', connection);
  } catch (e) {
    console.error(e);
    throw new Error('Could not create connection to database!')
  }
}
