import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
import { RATE_LIMIT } from 'src/core/constants/cache.key';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private readonly RATE_LIMIT_COUNT = 10;
  private readonly RATE_LIMIT_WINDOW = 60;

  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    // Fallback to request.ip
    const ip = request.ip;
    return ip === '::1' ? '127.0.0.1' : ip; // Normalize loopback IP
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const endpoint = request.originalUrl;
    const method = request.method;

    const rateLimitKey = `${RATE_LIMIT.key(ip)}:${method}:${endpoint}`;

    const currentRequestCount = await this.redis.incr(rateLimitKey);

    if (currentRequestCount === 1) {
      await this.redis.expire(rateLimitKey, this.RATE_LIMIT_WINDOW);
    }

    if (currentRequestCount > this.RATE_LIMIT_COUNT) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too Many Requests. Limit: ${this.RATE_LIMIT_COUNT} per ${this.RATE_LIMIT_WINDOW} seconds.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
