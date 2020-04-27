import { BaseEntity, PrimaryGeneratedColumn, ManyToMany, Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { Game } from "./game.model";

@Entity({
  orderBy: {
    id: 'ASC'
  }
})export class Move extends BaseEntity {
  @PrimaryGeneratedColumn({
    unsigned: true
  })
  public id!: number;

  @Column()
  public type!: number;

  @ManyToOne(_ => Game, game => game.moves)
  public game!: Game;
}
