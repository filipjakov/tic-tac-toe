import { IResolvers } from 'graphql-tools';
import { PubSub, withFilter, UserInputError } from 'apollo-server-express';
import { Game, Player, Move } from './models';
import Container from 'typedi';
import PlayerService from './services/player.service';
import GameService from './services/game.service';
import { GameStatus } from './enums/game-status.enum';
import { GameType } from './enums/game-type.enum';
import BotService from './services/bot.service';
import { mapToApolloError } from './utils/custom-error';

const pubsub = new PubSub();

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
      const userService = Container.get(PlayerService);
      return await userService.find(id) ?? null;
    },
    async users(): Promise<Player[]> {
      const userService = Container.get(PlayerService);
      return await userService.findAll();
    },
    async game(_, { id }): Promise<Game | null> {
      const gameService = Container.get(GameService);
      return await gameService.find(id) ?? null;
    },
    async games(): Promise<Game[]> {
      const gameService = Container.get(GameService);
      return await gameService.findAll() ?? null;
    }
  },
  Mutation: {
    async createGame(_, { type: gameType }, context): Promise<Game> {
      const { id: playerId } = context.player as Player;
      const gameService = Container.get(GameService);

      try {
        return await gameService.create({ playerId, gameType });
      } catch (e) {
        throw mapToApolloError(e);
      }
    },
    async makeMove(_, { gameId, newMove }, context): Promise<Move> {
      const { id: playerId } = context.player as Player;
      const gameService = Container.get(GameService);
      
      let move: Move;

      try {
        move = await gameService.move({ playerId, gameId, newMove });
      } catch(e) {
        throw mapToApolloError(e);
      }

      pubsub.publish('GAME', move.game);

      if(move.game.type === GameType.SINGLE && move.game.status === GameStatus.IN_PROGRESS) {
        // Schedule bot's move after the current loop cycle
        setImmediate(async () => {
          const botService = Container.get(BotService);
          const { id } = await botService.findOrCreateBot();
          const optimalMove = await botService.findOptimalMove(gameId);
          const move = await gameService.move({ playerId: id, gameId, newMove: optimalMove });

          pubsub.publish('GAME', move.game);
        });
      } 

      return move;
    },
    async joinGame(_, { id: gameId }, context): Promise<Game> {
      const { id: playerId } = context.player as Player;
      try {
        const game = await Container.get(GameService).join({ playerId, gameId }) ?? null;

        pubsub.publish('GAME', game);
        return game;
      } catch (e) {
        throw mapToApolloError(e);
      }
    },
  },
  Subscription: {
    game: {
      resolve: (payload) => {
        console.log(payload);
        return payload;
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator('GAME'),
        (payload: Game, { gameId }) => {
          return payload.id === parseInt(gameId);
        }
      )
    },
  }
};

export default resolverMap;
