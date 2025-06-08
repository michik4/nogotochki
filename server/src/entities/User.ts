import { Entity, Column, Index, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Client } from './Client';
import { Master } from './Master';

export enum UserType {
  CLIENT = 'client',
  MASTER = 'master',
  ADMIN = 'admin'
}

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'password_hash'
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false
  })
  phone!: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CLIENT,
    nullable: false
  })
  type!: UserType;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_login_at'
  })
  lastLoginAt?: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'avatar_url'
  })
  avatarUrl?: string;

  // Связи
  @OneToOne(() => Client, client => client.user, { cascade: true })
  client?: Client;

  @OneToOne(() => Master, master => master.user, { cascade: true })
  master?: Master;

  // Методы для работы с паролем
  toJSON() {
    const { passwordHash, ...result } = this;
    return result;
  }
} 