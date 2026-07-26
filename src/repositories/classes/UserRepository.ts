import { User } from "../../entities/User";
import { IUserRepository } from "../interfaces/IUserRepository";
import { DataSource } from 'typeorm';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UserRepository implements IUserRepository 
{
  constructor(
    @inject(DataSource) private dataSource: DataSource
  ) {}

  private get userRepository() {
    return this.dataSource.getRepository(User);
  }

  async GetUsers(): Promise<User[]> 
  {
    return this.userRepository.find();
  }
  
  async DeleteUser(id: number): Promise<void> 
  {
    await this.userRepository.delete(id);
  }
  
  async UpdateUser(id: number, user: Partial<User>): Promise<User> 
  {
    await this.userRepository.update(id, user);
    const updatedUser = await this.GetUserById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }

  async GetUserById(id: number): Promise<User | null> 
  {
    return this.userRepository.findOne({ where: { id } });
  }

  async GetUserByEmail(email: string): Promise<User | null> 
  {
    return this.userRepository.findOne({ where: { email } });
  }

  async GetUserByUsername(username: string): Promise<User | null> 
  {
    return this.userRepository.findOne({ where: { username } });
  }

  async getUserByResetToken(token: string): Promise<User | null> 
  {
    return this.userRepository.createQueryBuilder('user')
      .where('user.resetPasswordToken = :token', { token })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();
  }

  async CreateUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> 
  {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
}
