import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('clients')
export class Client extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  location?: string;

  @Column({
    type: 'text',
    nullable: true
  })
  preferences?: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'favorite_styles'
  })
  favoriteStyles?: string[];

  // Связь с пользователем
  @OneToOne(() => User, user => user.client)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'uuid',
    name: 'user_id'
  })
  userId!: string;
} 