import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from 'src/core/core.module';
import { StoreModule } from '../store/store.module';
import { UserModule } from '../user/user.module';
import { TransactionController } from './controllers/transaction.controller';
import { Transaction, TransactionSchema } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    CoreModule,
    StoreModule,
    UserModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [],
})
export class TransactionModule {}
