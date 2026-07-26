import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'global_config' })
export class GlobalConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'json' })
  config!: any;
}

