import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Design } from './Design';
import { User } from './User';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({
    type: 'text',
    nullable: false
  })
  content!: string;

  @Column({
    type: 'integer',
    default: 0,
    name: 'likes_count'
  })
  likesCount!: number;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active'
  })
  isActive!: boolean;

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

  // Ответ на комментарий (один к одному)
  @OneToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'answer_id' })
  answer?: Comment;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'answer_id'
  })
  answerId?: string;
} 