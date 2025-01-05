import { Module } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { DistributedLockService } from './services/distributed-lock.service';

@Module({
  imports: [],
  providers: [CacheService, DistributedLockService],
  exports: [CacheService, DistributedLockService],
})
export class CoreModule {}
