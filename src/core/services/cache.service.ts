import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private readonly logger = new Logger(CacheService.name);

  /**
   * Retrieves a value from the cache.
   * @param key - The key to retrieve.
   * @returns A promise that resolves to the value if found, or null if not found.
   * @throws An error if there was a problem communicating with Redis.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Sets a value in the cache.
   * @param key - The key to set.
   * @param value - The value to set.
   * @param expiry - The TTL (time to live) of the key in seconds. If not provided, the key will not expire.
   * @throws An error if there was a problem communicating with Redis.
   */
  async set(key: string, value: any, expiry?: number): Promise<void> {
    try {
      if (expiry) {
        await this.redis.set(key, JSON.stringify(value), 'EX', expiry);
      } else {
        await this.redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Caches the result of a function.
   * @param key - The key to store the result under.
   * @param expiry - The TTL (time to live) of the key in seconds.
   * @param func - The function to call if the key is not found.
   * @returns A promise that resolves to the cached value.
   * @throws An error if there was a problem communicating with Redis.
   */
  async cached<T>(
    key: string,
    expiry: number,
    func: () => Promise<T | null>,
  ): Promise<T> {
    const value = await this.get<T>(key);

    if (value) {
      return value;
    }

    const result = await func();
    if (!result) {
      return null;
    }
    await this.set(key, result, expiry);
    return result;
  }
}
