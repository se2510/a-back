import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate
} from 'typeorm';
import { UserRole } from '../constants/admin';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ARTIST })
  role!: UserRole;

  @Column({ type: 'enum', enum: ['pending_verification', 'active'], default: 'pending_verification' })
  state!: 'pending_verification' | 'active';

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;
}
