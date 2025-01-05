import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGenericRepository } from 'src/core/abstracts';
import { MongoGenericRepository } from 'src/core/repositories/mongo-generic.repository';
import { TransactionQueryDto } from '../dtos/transaction.dto';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  data: IGenericRepository<Transaction>;

  constructor(
    @InjectModel(Transaction.name) transactionModel: Model<Transaction>,
  ) {
    this.data = new MongoGenericRepository(transactionModel);
  }

  /**
   * Creates a new transaction document in the collection.
   * @param data - The partial transaction data to create.
   * @returns A promise that resolves to the created transaction document.
   */
  async create(data: Partial<Transaction>): Promise<Transaction> {
    return this.data.create(data);
  }

  /**
   * Retrieves a paginated collection of transactions for a specific store.
   * @param storeId - The ID of the store for which transactions are retrieved.
   * @param query - The transaction query parameters including type, startDate, and endDate.
   * @returns A promise that resolves to an array of transactions.
   */
  async getPaginatedCollection(
    storeId: string,
    query: TransactionQueryDto,
  ): Promise<Transaction[]> {
    const filter: any = { storeId };

    if (query.type) filter.type = query.type;
    if (query.startDate) filter.createdAt = { $gte: new Date(query.startDate) };
    if (query.endDate)
      filter.createdAt = { ...filter.createdAt, $lte: new Date(query.endDate) };

    return this.data.getPaginatedCollection(filter, query.size, query.page, {
      _id: -1,
    });
  }

  /**
   * Aggregates transactions using the provided pipeline.
   * @param pipeline - The pipeline of aggregate operations.
   * @returns A promise that resolves to an array of aggregated results.
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.data.aggregate(pipeline);
  }
}
