import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Project } from './Project';
import { Asset }   from './Asset';

@Entity({ name: 'timeline_events' })
export class TimelineEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, proj => proj.id)
  project!: Project;

  @Column({ type: 'enum', enum: ['clip','transition','audio'] })
  eventType!: 'clip' | 'transition' | 'audio';

  @ManyToOne(() => Asset, asset => asset.id)
  asset!: Asset;

  @Column('double')
  startTime!: number;

  @Column('double')
  endTime!: number;

  @Column({ type: 'json', nullable: true })
  properties?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
