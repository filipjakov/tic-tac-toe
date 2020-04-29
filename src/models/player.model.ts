import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Game } from "./game.model";

@Entity({
  orderBy: {
    id: 'ASC'
  }
})
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn({
    unsigned: true
  })
  public id!: number;

  @Column({
    length: 128,
    nullable: false
  })
  public name!: string;

  @ManyToMany(_ => Game, game => game.players, { cascade: true })
  @JoinTable()
  public games!: Array<Game>;

  @CreateDateColumn()
  public created_at!: Date;

  @UpdateDateColumn()
  public updated_at!: Date;
}
