import { //conexión con la base de datos
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Project } from './Project';
import { Asset } from './Asset';
import { EventType } from '../dtos/Timeline';

@Entity({ name: 'timeline_events' })
export class TimelineEvent {
  @PrimaryGeneratedColumn()
  timeline_id!: number; // Clave primaria autogenerada

  @ManyToOne(() => Project, proj => proj.id, { onDelete: "CASCADE" }) // Asegura eliminación en cascada si el proyecto se borra
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ 
    type: 'enum', 
    enum: EventType,
    comment: 'Tipo de evento: clip, text, o audio'
  })
  event_type!: EventType;

  @ManyToOne(() => Asset, asset => asset.id, { onDelete: "SET NULL" }) // Permite conservar el evento aunque el asset se elimine
  @JoinColumn({ name: "asset_id" })
  asset!: Asset;

  @Column({ type: 'double', comment: 'Tiempo de inicio del evento en segundos' })
  start_time!: number;

  @Column({ type: 'double', comment: 'Tiempo de fin del evento en segundos' })
  end_time!: number;

  @Column({ 
    type: 'json', 
    nullable: true,
    comment: 'Propiedades adicionales del evento en formato JSON' 
  })
  properties?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}