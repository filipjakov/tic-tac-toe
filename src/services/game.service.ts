import { Inject, Service } from "typedi";
import { Connection } from "typeorm";
import { CustomErrorType } from "../abstracts/enums/cutom-error-type.enum";
import { GameStatus } from "../abstracts/enums/game-status.enum";
import { GameType } from "../abstracts/enums/game-type.enum";
import { Game, Move, Player } from "../models";
import { CustomError } from "../utils/custom-error";
import BotService from "./bot.service";
import { PlayerService } from "./player.service";

@Service()
export class GameService {
  constructor(
    @Inject("db.connection") private connection: Connection,
    public playerService: PlayerService,
    public botService: BotService
  ) {}

  public find(id: number): Promise<Game | undefined> {
    return this.connection.getRepository(Game).findOne(id, { relations: ["players", "moves", "moves.player", "moves.game"] });
  }

  public findAll(): Promise<Game[]> {
    return this.connection.getRepository(Game).find({ relations: ["players", "moves", "moves.player", "moves.game"]});
  }

  public async create({ playerId, gameType }: { playerId: number; gameType: GameType}): Promise<Game> {
    const player = await this.connection.getRepository(Player).findOne(playerId);

    if (!player) {
      throw new CustomError(`No user found with id ${playerId}`, CustomErrorType.NO_OBJECT);
    }

    const game = new Game();
    game.type = gameType;
    game.status = gameType === GameType.SINGLE ? GameStatus.IN_PROGRESS : GameStatus.WAITING_FOR_PLAYER_TO_JOIN;
    game.players = [
      player,
      // Conditionally add the bot if it is a single player game
      ...(gameType === GameType.SINGLE ? [await this.botService.findOrCreateBot()] : [])
    ];
    game.currentPlayer = player.id;

    return this.connection.getRepository(Game).save(game);
  }
  
   public async join({ playerId, gameId }: { playerId: number, gameId: number }): Promise<Game> {
    const player = await this.connection.getRepository(Player).findOne(playerId);

    if (!player) {
      throw new CustomError(`No player with id ${playerId}`, CustomErrorType.NO_OBJECT);
    }

    const game = await this.connection.getRepository(Game).findOne(gameId, { relations: ["players", "moves", "moves.player"] });
    
    if (!game) {
      throw new CustomError(`Can't join a non-existing game ${gameId}!`, CustomErrorType.NO_OBJECT);
    }

    if (game.status === GameStatus.DONE || game.status === GameStatus.TIE) {
      throw new CustomError(`Game ${gameId} is already done!`, CustomErrorType.ILLEGAL_MOVE);
    }

    if(game.type === GameType.SINGLE) {
      throw new CustomError(`Can't join a singleplayer game: ${gameId}!`, CustomErrorType.ILLEGAL_MOVE);
    }

    if(game.players.length === 2) {
      throw new CustomError(`Game reached max number of players!`, CustomErrorType.ILLEGAL_MOVE);
    }

    if(game.players.some(({ id }) => id === playerId)) {
      throw new CustomError(`User ${playerId} already in the game!`, CustomErrorType.ILLEGAL_MOVE);
    }

    game.players = [...game.players, player];
    game.status = GameStatus.IN_PROGRESS;

    return this.connection.getRepository(Game).save(game);
  }

  public async move({ playerId, gameId, newMove }: { playerId: number; gameId: number; newMove: number }): Promise<Move> {
    const player = await this.connection.getRepository(Player).findOne(playerId, { relations: ["games", "games.moves", "games.players", "games.moves.player"] });

    if (!player) {
      throw new CustomError(`No player with id ${playerId}`, CustomErrorType.NO_OBJECT);
    }

    const game = player.games.find(({ id }) => id === gameId);

    if (!game) {
      throw new CustomError(`Can't make move on a game that does not exist or was not joined ${gameId}!`, CustomErrorType.NO_OBJECT);
    }

    if (game.status === GameStatus.DONE || game.status === GameStatus.TIE) {
      throw new CustomError(`Game ${gameId} is already done!`, CustomErrorType.ILLEGAL_MOVE);
    }

    if (game.status === GameStatus.WAITING_FOR_PLAYER_TO_JOIN) {
      throw new CustomError(`Still waiting for other player to join!`, CustomErrorType.ILLEGAL_MOVE);
    }

    if (game.currentPlayer !== playerId) {
      throw new CustomError(`Illegal move, not turn of user ${player.name}!`, CustomErrorType.ILLEGAL_MOVE);
    }

    if(game.moves.some(({ type }) => type === newMove)) {
      throw new CustomError(`Illegal move, move ${newMove} already made!`, CustomErrorType.ILLEGAL_MOVE);
    }

    const move = new Move();
    move.type = newMove;
    move.game = game;
    move.player = player;
  
    game.moves = [...game.moves, move];
    game.status = this.checkGameStatus(game.moves);

    // Set the turn for other player if game is still not over
    // Otherwise, currentPlayer field will contain the id of the winner (current player)
    if (game.status !== GameStatus.DONE) {
      game.currentPlayer = (game.players.find(({ id }) => id !== playerId) as Player).id;
    }

    return await this.connection.getRepository(Move).save(move);
  }

  private checkGameStatus(moves: Move[]): GameStatus {
    // Flatten all the moves, populate the index with player id
    const flatMoves: Array<number> = moves
      .map(({ player: { id }, type }) => [id, type])
      .reduce((acc, [id, type]) => {
        acc[type] = id;
        return acc;
      }, Array.from({ length: 9 }));

    const winningConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [6, 4, 2]
    ];

    for (let condition of winningConditions) {
      const allMoves = condition.map(i => flatMoves[i]);

      const allWinningMovesDefined = allMoves.every(Boolean);
      const allMovesBelongToOnePlayer = allMoves.every((val, _, arr) => val === arr[0]);

      if (allWinningMovesDefined && allMovesBelongToOnePlayer) {
        return GameStatus.DONE;
      };
    }

    return flatMoves.every(Boolean) ? GameStatus.TIE : GameStatus.IN_PROGRESS;
  }
}
