import { BaseEntity, PrimaryGeneratedColumn, ManyToMany, Entity, Column, OneToMany, JoinTable, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { Player } from "./player.model";
import { Move } from "./move.model";
import { GameType } from "../enums/game-type.enum";
import { GameStatus } from "../enums/game-status.enum";

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
