import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Game } from "./game.model";
import { Player } from "./player.model";

@Entity({
  orderBy: {
    id: 'ASC'
  }
})
export class Move extends BaseEntity {
  @PrimaryGeneratedColumn({
    unsigned: true
  })
  public id!: number;

  @Column()
  public type!: number;

  @ManyToOne(_ => Player)
  public player!: Player;

  @ManyToOne(_ => Game, game => game.moves, { cascade: true })
  public game!: Game;

  @CreateDateColumn()
  public created_at!: Date;

  @UpdateDateColumn()
  public updated_at!: Date;
}
