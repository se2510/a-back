import { User } from "../../entities/User";
import { IUserService, ResetPasswordResult } from "../interfaces/IUserService";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { inject, injectable } from "tsyringe";
import * as argon2 from 'argon2'; // Cambia bcrypt por argon2
import { mapUser, mapUsers } from '../../mappers/userMapper';

@injectable()
export class UserService implements IUserService 
{
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async GetUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.GetUsers();
    return mapUsers(users);
  }
  
  async DeleteUser(id: number): Promise<void> {
    await this.userRepository.DeleteUser(id);
  }
  
  async UpdateUser(id: number, user: Partial<User>): Promise<User> {
    return await this.userRepository.UpdateUser(id, user);
  }
  
  async GetUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.GetUserById(id);
    return user ? mapUser(user) : null;
  }
  
  async GetUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.GetUserByEmail(email);
  }

  async GetUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.GetUserByUsername(username);
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    return this.userRepository.getUserByResetToken(token);
  }
  
  async CreateUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return await this.userRepository.CreateUser(user);
  }

  async savePasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    const user = await this.userRepository.GetUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    await this.userRepository.UpdateUser(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
    try {
      // Obtener todos los usuarios (esto es ineficiente, pero necesario sin un método findOne en el repositorio)
      const users = await this.userRepository.GetUsers();
      
      // Buscar usuario por token de restablecimiento
      const user = users.find(u => 
        u.resetPasswordToken === token && 
        u.resetPasswordExpires && 
        u.resetPasswordExpires > new Date()
      );

      if (!user) {
        return {
          success: false,
          message: 'El enlace de restablecimiento no es válido o ha expirado.'
        };
      }

      // Hashear la nueva contraseña con argon2
      const hashedPassword = await argon2.hash(newPassword);

      // Actualizar contraseña y limpiar token
      await this.userRepository.UpdateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });

      return { success: true };
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      return {
        success: false,
        message: 'Ocurrió un error al restablecer la contraseña.'
      };
    }
  }
}
