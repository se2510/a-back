import { injectable } from 'tsyringe';
import Redis from 'ioredis';

@injectable()
export class TokenBlacklistService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    await this.redis.setex(`blacklist:${token}`, expiresIn, 'blacklisted');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return (await this.redis.exists(`blacklist:${token}`)) === 1;
  }
}
