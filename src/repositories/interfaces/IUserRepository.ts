import { User } from '../../entities/User';

export interface IUserRepository 
{
    GetUsers(): Promise<User[]>;
    DeleteUser(id: number): Promise<void>;
    UpdateUser(id: number, user: Partial<User>): Promise<User>;
    GetUserById(id: number): Promise<User | null>;
    GetUserByEmail(email: string): Promise<User | null>;
    GetUserByUsername(username: string): Promise<User | null>;
    getUserByResetToken(token: string): Promise<User | null>;
    CreateUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}
