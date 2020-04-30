import { PubSub, withFilter } from 'apollo-server-express';
import { IResolvers } from 'graphql-tools';
import Container from 'typedi';
import { GameStatus } from './enums/game-status.enum';
import { GameType } from './enums/game-type.enum';
import Logger from './loaders/logger';
import { Game, Move, Player } from './models';
import BotService from './services/bot.service';
import { GameService } from './services/game.service';
import { PlayerService } from './services/player.service';
import { mapToApolloError } from './utils/custom-error';

const pubsub = new PubSub();
const topic = 'GAME';

const resolverMap: IResolvers = {
  GameType: {
    SINGLE: 's',
    MULTI: 'm'
  },
  MoveType: {
    TOP_LEFT: 0,
    TOP_CENTER: 1,
    TOP_RIGHT: 2,
    MIDDLE_LEFT: 3,
    MIDDLE_CENTER: 4,
    MIDDLE_RIGHT: 5,
    BOTTOM_LEFT: 6,
    BOTTOM_CENTER: 7,
    BOTTOM_RIGHT: 8
  },
  Query: {
    async user(_, { id }): Promise<Player | null>  {
      return await Container.get(PlayerService).find(id) ?? null;
    },
    async users(): Promise<Player[]> {
      return await Container.get(PlayerService).findAll();
    },
    async game(_, { id }): Promise<Game | null> {
      return await Container.get(GameService).find(id) ?? null;
    },
    async games(): Promise<Game[]> {
      return await Container.get(GameService).findAll();
    }
  },
  Mutation: {
    async createGame(_, { type: gameType }, context): Promise<Game> {
      try {
        const { id: playerId, name } = context.player as Player;

        const game = await Container.get(GameService).create({ playerId, gameType });
        Logger.info(`User ${name} created the game: ${game.id} of type: ${game.type}`);
        return game;
      } catch (e) {
        Logger.error(e);
        throw mapToApolloError(e);
      }
    },
    async joinGame(_, { id: gameId }, context): Promise<Game> {
      try {
        const { id: playerId, name } = context.player as Player;

        const game = await Container.get(GameService).join({ playerId, gameId });
        Logger.info(`User ${name} joined the game: ${game.id}`);

        pubsub.publish(topic, game);
        return game;
      } catch (e) {
        Logger.error(e);
        throw mapToApolloError(e);
      }
    },
    async makeMove(_, { gameId, newMove }, context): Promise<Move> {
      const { id: playerId, name } = context.player as Player;
      const gameService = Container.get(GameService);
      
      let move: Move;

      try {
        move = await gameService.move({ playerId, gameId, newMove });
        Logger.info(`User ${name} made a move: ${newMove}`)
      } catch(e) {
        Logger.error(e);
        throw mapToApolloError(e);
      }

      pubsub.publish(topic, move.game);

      if(move.game.type === GameType.SINGLE && move.game.status === GameStatus.IN_PROGRESS) {
        // Schedule bot's move after the current event-loop cycle
        setImmediate(async () => {
          const botService = Container.get(BotService);
          const { id: botId } = await botService.findOrCreateBot();
          const optimalMove = await botService.findOptimalMove(gameId);
          const botMove = await gameService.move({ playerId: botId, gameId, newMove: optimalMove });

          pubsub.publish(topic, botMove.game);
          Logger.info(`Bot made a move: ${optimalMove}`);
        });
      } 

      return move;
    },
  },
  Subscription: {
    game: {
      resolve: (payload) => payload,
      subscribe: withFilter(
        () => pubsub.asyncIterator(topic),
        (payload: Game, { gameId }) => {
          return payload.id === parseInt(gameId);
        }
      )
    },
  }
};

export default resolverMap;
