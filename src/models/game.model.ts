import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GameStatus } from "../enums/game-status.enum";
import { GameType } from "../enums/game-type.enum";
import { Move } from "./move.model";
import { Player } from "./player.model";

@Entity({
  orderBy: {
    id: 'ASC'
  }
})
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn({
    unsigned: true
  })
  public id!: number;

  @Column({
    type: 'text'
  })
  public type!: GameType;

  @Column({
    type: 'text',
  })
  public status!: GameStatus

  @Column({
    type: 'int',
  })
  public currentPlayer!: number

  @ManyToMany(_ => Player, user => user.games)
  public players!: Array<Player>;

  @OneToMany(_ => Move, move => move.game)
  public moves!: Array<Move>;

  @CreateDateColumn()
  public created_at!: Date;

  @UpdateDateColumn()
  public updated_at!: Date;
}
