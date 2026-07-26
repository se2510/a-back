<<<<<<< HEAD
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id)
  owner!: User;

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

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
import { User } from './User';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id)
  owner!: User;

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  state!: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
>>>>>>> c5a916cd92f846dc024d7bf83c6ba8a95e38f2d6
