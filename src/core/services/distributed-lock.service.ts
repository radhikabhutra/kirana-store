import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { LOCK } from '../constants/cache.key';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);
  private readonly DEFAULT_RETRY_COUNT = 3;
  private readonly DEFAULT_RETRY_DELAY = 200; // milliseconds

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Acquires a distributed lock with the given key. If the lock is successfully acquired,
   * the lock value is returned. If the lock is not acquired within the given retry count,
   * null is returned.
   *
   * @param key The key to lock.
   * @param ttl The TTL (time to live) of the lock in milliseconds. If not provided, the default TTL is used.
   * @param retryCount The number of times to retry acquiring the lock if it is not available. If not provided,
   * the default retry count is used.
   *
   * @returns The lock value if the lock is acquired, or null if the lock is not acquired.
   */
  async acquireLock(
    key: string,
    ttl: number = LOCK.expiry,
    retryCount: number = this.DEFAULT_RETRY_COUNT,
  ): Promise<string | null> {
    const lockKey = LOCK.key(key);
    const lockValue = randomUUID();
    let attempts = 0;

    while (attempts < retryCount) {
      try {
        const acquired = await this.redis.set(
          lockKey,
          lockValue,
          'PX',
          ttl,
          'NX',
        );

        if (acquired === 'OK') {
          this.logger.debug(`Lock acquired for key: ${key}`);
          return lockValue;
        }

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, this.DEFAULT_RETRY_DELAY),
        );
        attempts++;
      } catch (error) {
        this.logger.error(`Failed to acquire lock for key ${key}:`, error);
        throw error;
      }
    }

    this.logger.warn(
      `Failed to acquire lock for key ${key} after ${retryCount} attempts`,
    );
    return null;
  }

  /**
   * Releases a distributed lock by deleting the Redis key.
   * This is an atomic operation that checks the value of the key before deleting.
   * If the value does not match the provided lockValue, the key is not deleted.
   * @param key The key to release the lock for.
   * @param lockValue The value associated with the lock.
   * @returns A boolean indicating if the lock was released.
   * @throws An error if there was a problem communicating with Redis.
   */
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    // Lua script for atomic release operation
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await this.redis.eval(script, 1, LOCK.key(key), lockValue);

      const released = result === 1;
      if (released) {
        this.logger.debug(`Lock released for key: ${key}`);
      }
      return released;
    } catch (error) {
      this.logger.error(`Failed to release lock for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a distributed lock is set for the given key.
   * @param key The key to check.
   * @returns A boolean indicating if the lock is set.
   * @throws An error if there was a problem communicating with Redis.
   */
  async isLocked(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(LOCK.key(key));
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check lock status for key ${key}:`, error);
      throw error;
    }
  }
}
