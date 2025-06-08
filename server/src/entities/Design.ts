import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Master } from './Master';
import { User } from './User';

export enum DesignCategory {
  CLASSIC = 'classic',
  FRENCH = 'french',
  GEL = 'gel',
  ART = 'art',
  SEASONAL = 'seasonal',
  MANICURE = 'manicure',
  PEDICURE = 'pedicure',
  NAIL_ART = 'nail_art',
  EXTENSION = 'extension',
  REPAIR = 'repair'
}

export enum DesignDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

@Entity('designs')
export class Design extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: DesignCategory,
    nullable: false
  })
  category!: DesignCategory;

  @Column({
    type: 'enum',
    enum: DesignDifficulty,
    default: DesignDifficulty.MEDIUM
  })
  difficulty!: DesignDifficulty;

  @Column({
    type: 'json',
    nullable: true,
    name: 'image_urls'
  })
  imageUrls?: string[];

  @Column({
    type: 'json',
    nullable: true,
    name: 'video_urls'
  })
  videoUrls?: string[];

  @Column({
    type: 'json',
    nullable: true
  })
  tags?: string[];

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
    name: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: 'integer',
    default: 0,
    name: 'views_count'
  })
  viewsCount!: number;

  @Column({
    type: 'integer',
    default: 0,
    name: 'likes_count'
  })
  likesCount!: number;

  // Связь с мастером
  @ManyToOne(() => Master, { nullable: false })
  @JoinColumn({ name: 'master_id' })
  master!: Master;

  @Column({
    type: 'uuid',
    name: 'master_id'
  })
  masterId!: string;

  // Автор дизайна (может быть клиентом или мастером)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: User;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'author_id'
  })
  authorId?: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_base_catalog'
  })
  isBaseCatalog!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_approved'
  })
  isApproved!: boolean;
} 