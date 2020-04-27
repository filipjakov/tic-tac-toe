import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Game } from "./game.model";

@Entity({
  orderBy: {
    id: 'ASC'
  }
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({
    unsigned: true
  })
  public id!: number;

  @Column({
    length: 128,
    nullable: false
  })
  public name!: string;

  @OneToMany(_ => Game, game => game.id)
  public games!: Array<Game>;
}
