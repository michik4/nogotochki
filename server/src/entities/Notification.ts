import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export enum NotificationType {
  BOOKING_REQUEST = 'booking_request',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  RATING_DECREASED = 'rating_decreased',
  NEW_COMMENT = 'new_comment',
  COMMENT_REPLY = 'comment_reply'
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationType,
    nullable: false
  })
  type!: NotificationType;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: false
  })
  message!: string;

  @Column({
    type: 'json',
    nullable: true
  })
  data?: any;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_read'
  })
  isRead!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_sent'
  })
  isSent!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'sent_at'
  })
  sentAt?: Date;

  // Связи
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'uuid',
    name: 'user_id'
  })
  userId!: string;
} 