import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Client } from './Client';
import { Master } from './Master';
import { Design } from './Design';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

@Entity('bookings')
export class Booking extends BaseEntity {
  @Column({
    type: 'timestamp',
    nullable: false,
    name: 'scheduled_at'
  })
  scheduledAt!: Date;

  @Column({
    type: 'integer',
    nullable: false,
    name: 'duration_minutes'
  })
  durationMinutes!: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status!: BookingStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  price?: number;

  @Column({
    type: 'text',
    nullable: true
  })
  notes?: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'cancellation_reason'
  })
  cancellationReason?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'confirmed_at'
  })
  confirmedAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'completed_at'
  })
  completedAt?: Date;

  // Связи
  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({
    type: 'uuid',
    name: 'client_id'
  })
  clientId!: string;

  @ManyToOne(() => Master, { nullable: false })
  @JoinColumn({ name: 'master_id' })
  master!: Master;

  @Column({
    type: 'uuid',
    name: 'master_id'
  })
  masterId!: string;

  @ManyToOne(() => Design, { nullable: true })
  @JoinColumn({ name: 'design_id' })
  design?: Design;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'design_id'
  })
  designId?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'response_deadline'
  })
  responseDeadline?: Date;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_auto_rejected'
  })
  isAutoRejected!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'alternative_time_proposed'
  })
  alternativeTimeProposed?: Date;
} 