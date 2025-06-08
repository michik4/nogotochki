import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('masters')
export class Master extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  location?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true
  })
  latitude?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true
  })
  longitude?: number;

  @Column({
    type: 'json',
    nullable: true
  })
  specialties?: string[];

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    nullable: false
  })
  rating!: number;

  @Column({
    type: 'integer',
    default: 0,
    nullable: false,
    name: 'reviews_count'
  })
  reviewsCount!: number;

  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'work_schedule'
  })
  workSchedule?: {
    [day: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };

  @Column({
    type: 'json',
    nullable: true,
    name: 'portfolio_images'
  })
  portfolioImages?: string[];

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_verified'
  })
  isVerified!: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'base_price'
  })
  basePrice?: number;

  // Связь с пользователем
  @OneToOne(() => User, user => user.master)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'uuid',
    name: 'user_id'
  })
  userId!: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_response_at'
  })
  lastResponseAt?: Date;

  @Column({
    type: 'integer',
    default: 0,
    name: 'response_timeout_count'
  })
  responseTimeoutCount!: number;
} 