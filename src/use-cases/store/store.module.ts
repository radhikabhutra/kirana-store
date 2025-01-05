import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { StoreController } from './controllers/store.controller';
import { Store, StoreSchema } from './entities/store.entity';
import { StoreRepository } from './repositories/store.repository';
import { StoreService } from './services/store.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    UserModule,
  ],
  controllers: [StoreController],
  providers: [StoreService, StoreRepository],
  exports: [StoreService],
})
export class StoreModule {}
