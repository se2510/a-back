import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Project } from './Project';

@Entity({ name: 'generation_jobs' })
export class GenerationJob {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, proj => proj.id)
  project!: Project;

  @Column('text')
  prompt!: string;

  @Column({ type: 'enum', enum: ['pending','running','done','error'], default: 'pending' })
  status!: 'pending' | 'running' | 'done' | 'error';

  @Column({ nullable: true })
  resultUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
