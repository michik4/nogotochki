import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Design } from './Design';
import { User } from './User';

@Entity('likes')
@Index(['userId', 'designId'], { unique: true })
export class Like extends BaseEntity {
  // Связи
  @ManyToOne(() => Design, { nullable: false })
  @JoinColumn({ name: 'design_id' })
  design!: Design;

  @Column({
    type: 'uuid',
    name: 'design_id'
  })
  designId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'uuid',
    name: 'user_id'
  })
  userId!: string;
} 