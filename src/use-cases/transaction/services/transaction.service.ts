import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import mongoose from 'mongoose';
import { CURRENCY_RATES } from 'src/core/constants/cache.key';
import { CacheService } from 'src/core/services/cache.service';
import { DistributedLockService } from 'src/core/services/distributed-lock.service';
import { IUser } from '../../user/entities/user.entity';
import {
  CreateTransactionDto,
  TransactionQueryDto,
} from '../dtos/transaction.dto';
import { Currency } from '../enums/currency';
import { TransactionType } from '../enums/transaction';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionRepository: TransactionRepository,
    private readonly cacheService: CacheService,
    private readonly distributedLockService: DistributedLockService,
  ) {}

  /**
   * Fetches currency rates from the configured API and caches them for the configured amount of time.
   * If there is an error fetching the rates, a ServiceUnavailableException is thrown.
   * @returns A promise that resolves to the currency rates.
   */
  private async getCurrencyRates(): Promise<any> {
    return this.cacheService.cached(
      CURRENCY_RATES.key,
      CURRENCY_RATES.expiry,
      async () => {
        try {
          const response = await axios.get(
            this.configService.get('fxRates.api'),
          );
          return response.data.rates;
        } catch (error) {
          this.logger.error('Error fetching currency rates:', error);
          throw new ServiceUnavailableException('Currency service unavailable');
        }
      },
    );
  }

  /**
   * Converts a given amount of currency to its equivalent in INR.
   *
   * If the given currency is INR, the amount is returned as is.
   * Otherwise, the amount is converted to INR using the currency rates fetched
   * from the configured API.
   * @param amount The amount of currency to be converted
   * @param currency The currency of the given amount
   * @returns The equivalent amount in INR
   */
  private async convertToINR(
    amount: number,
    currency: Currency,
  ): Promise<number> {
    if (currency === Currency.INR) return amount;

    const rates = await this.getCurrencyRates();
    const inrRate = rates.INR;
    const currencyRate = rates[currency];

    return (amount / currencyRate) * inrRate;
  }

  /**
   * Creates a transaction for the given user and transaction details.
   * The function acquires a distributed lock to ensure transaction integrity.
   * If a lock cannot be acquired, a ConflictException is thrown indicating
   * that a transaction is already in progress. The transaction amount is
   * converted to INR before being saved to the repository.
   *
   * @param user The user creating the transaction
   * @param dto The transaction details to be created
   * @returns A promise that resolves to the created transaction
   * @throws ConflictException if a transaction is already in progress
   */
  async createTransaction(user: IUser, dto: CreateTransactionDto) {
    const lockKey = `transaction:${user.storeId.toString()}`;
    const lockValue = await this.distributedLockService.acquireLock(lockKey);

    if (!lockValue) {
      throw new ConflictException('A transaction is already in progress');
    }

    try {
      const amountInINR = await this.convertToINR(dto.amount, dto.currency);

      return this.transactionRepository.create({
        ...dto,
        storeId: new mongoose.Types.ObjectId(user.storeId.toString()),
        createdBy: new mongoose.Types.ObjectId(user._id?.toString()),
        amountInINR,
      });
    } finally {
      await this.distributedLockService.releaseLock(lockKey, lockValue);
    }
  }

  /**
   * Retrieves a paginated collection of transactions for a specific store.
   * The page number in the query is converted to a skip value for pagination.
   *
   * @param storeId - The ID of the store for which transactions are retrieved.
   * @param query - The transaction query parameters including type, startDate, endDate, page, and size.
   * @returns A promise that resolves to an array of transactions.
   */
  async getTransactions(storeId: string, query: TransactionQueryDto) {
    const page = (query.page - 1) * query.size;
    query.page = page;

    return this.transactionRepository.getPaginatedCollection(storeId, query);
  }

  /**
   * Generates a report of transactions for a specific store over a given time period.
   *
   * The report aggregates transaction data by the specified grouping criteria
   * (day of the week, month, or year) and includes a summary of total amounts
   * and transaction counts for each transaction type (credit/debit).
   *
   * @param storeId - The ID of the store for which the report is generated.
   * @param durationType - The duration type for the report, either 'week' or 'month'.
   * @param startDate - The start date for the report's time period.
   * @param groupBy - The field to group the transactions by ('$dayOfWeek', '$month', or '$year').
   * @returns A promise that resolves to an object containing the start and end dates,
   *          the aggregated transactions, and a summary of the transactions.
   */
  async generateReport(
    storeId: string,
    durationType: 'week' | 'month',
    startDate: Date,
    groupBy: '$dayOfWeek' | '$month' | '$year' = '$dayOfWeek',
  ) {
    const endDate = new Date(startDate);
    if (durationType === 'week') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const pipeline = [
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            timePeriod: { [groupBy]: '$createdAt' },
            type: '$type',
          },
          totalAmount: { $sum: '$amountInINR' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.timePeriod',
          transactions: {
            $push: {
              type: '$_id.type',
              totalAmount: '$totalAmount',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ];

    const results = await this.transactionRepository.aggregate(pipeline);

    return {
      startDate,
      endDate,
      transactions: results,
      summary: await this.calculateSummary(storeId, startDate, endDate),
    };
  }

  /**
   * Calculates the summary of the transactions in the given time period.
   * @param storeId - The ID of the store for which the summary is calculated.
   * @param startDate - The start date of the time period for which the summary is calculated.
   * @param endDate - The end date of the time period for which the summary is calculated.
   * @returns A promise that resolves to an object containing the total credit amount,
   *          total debit amount, total transaction count, and the net flow amount.
   */
  private async calculateSummary(
    storeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const pipeline = [
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.CREDIT] },
                '$amountInINR',
                0,
              ],
            },
          },
          totalDebit: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.DEBIT] },
                '$amountInINR',
                0,
              ],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ];

    const [summary] = await this.transactionRepository.aggregate(pipeline);
    return (
      summary || {
        totalCredit: 0,
        totalDebit: 0,
        transactionCount: 0,
        netFlow: 0,
      }
    );
  }
}
