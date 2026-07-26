import { User } from '../../entities/User';

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
}

export interface IUserService {
  GetUsers(): Promise<Omit<User, 'password'>[]>;
  DeleteUser(id: number): Promise<void>;
  UpdateUser(id: number, user: Partial<User>): Promise<User>;
  GetUserById(id: number): Promise<Omit<User, 'password'> | null>;
  GetUserByEmail(email: string): Promise<User | null>;
  GetUserByUsername(username: string): Promise<User | null>;
  getUserByResetToken(token: string): Promise<User | null>;
  CreateUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  savePasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult>;
}
