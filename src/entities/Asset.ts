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
}
