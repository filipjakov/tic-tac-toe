import { BaseEntity, PrimaryGeneratedColumn, ManyToMany, Entity, Column, OneToMany } from "typeorm";
import { User } from "./user.model";
import { Move } from "./move.model";
import { GameType } from "../enums/game-type.enum";

@Entity({
  orderBy: {
    id: 'ASC'
  }
})export class Game extends BaseEntity {
  @PrimaryGeneratedColumn({
    unsigned: true
  })
  public id!: number;

  @Column({
    type: 'text'
  })
  public type!: GameType;

  @Column()
  public name!: string;

  @ManyToMany(_ => User, user => user.games)
  public users!: Array<User>;

  @OneToMany(_ => Move, move => move.id)
  public moves!: Array<Move>;
}
