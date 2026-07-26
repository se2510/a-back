<<<<<<< HEAD
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Project } from './Project';

@Entity({ name: 'assets' })
export class Asset {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, proj => proj.id)
  project!: Project;

  @Column({ type: 'enum', enum: ['image','audio','video','script'] })
  type!: 'image' | 'audio' | 'video' | 'script';

  @Column()
  filePath!: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: true })
  isActive!: boolean;
}
=======
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Project } from './Project';

@Entity({ name: 'assets' })
export class Asset {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, proj => proj.id)
  project!: Project;

  @Column({ type: 'enum', enum: ['image','audio','video','script'] })
  type!: 'image' | 'audio' | 'video' | 'script';

  @Column()
  filePath!: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  moderation_status!: 'pending' | 'approved' | 'rejected';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
>>>>>>> c5a916cd92f846dc024d7bf83c6ba8a95e38f2d6
