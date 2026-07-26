// src/mappers/userMapper.ts
import { User } from '../entities/User';

export function mapUser(user: User): Omit<User, 'password'> {
    if (!user) return user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
}

export function mapUsers(users: User[]): Omit<User, 'password'>[] {
    return users.map(mapUser);
}

