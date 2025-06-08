import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Design } from './Design';
import { Master } from './Master';

@Entity('master_designs')
@Index(['masterId', 'designId'], { unique: true })
export class MasterDesign extends BaseEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  price?: number;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'duration_minutes'
  })
  durationMinutes?: number;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_available'
  })
  isAvailable!: boolean;

  @Column({
    type: 'text',
    nullable: true
  })
  notes?: string;

  // Связи
  @ManyToOne(() => Design, { nullable: false })
  @JoinColumn({ name: 'design_id' })
  design!: Design;

  @Column({
    type: 'uuid',
    name: 'design_id'
  })
  designId!: string;

  @ManyToOne(() => Master, { nullable: false })
  @JoinColumn({ name: 'master_id' })
  master!: Master;

  @Column({
    type: 'uuid',
    name: 'master_id'
  })
  masterId!: string;
} 