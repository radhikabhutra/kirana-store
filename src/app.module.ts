import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import config from './config/config';
import { StoreModule } from './use-cases/store/store.module';
import { TransactionModule } from './use-cases/transaction/transaction.module';
import { UserModule } from './use-cases/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongo.uri'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('redis.uri'),
        type: 'single',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 10,
      },
    ]),
    AuthModule,
    UserModule,
    StoreModule,
    TransactionModule,
  ],
})
export class AppModule {}
