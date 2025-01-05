import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Active } from 'src/common/decorators/active.decorator';
import { Roles } from 'src/common/decorators/roles.decorators';
import { User } from 'src/common/decorators/user.decorator';
import { ActiveGuard } from 'src/common/guards/active.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RateLimitInterceptor } from 'src/common/interceptors/rate-limit.interceptor';
import { IUser } from '../../user/entities/user.entity';
import { UserRole } from '../../user/enums/roles';
import {
  CreateTransactionDto,
  TransactionQueryDto,
} from '../dtos/transaction.dto';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard, ActiveGuard)
@Active(true)
@UseInterceptors(RateLimitInterceptor)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Creates a new transaction in the database.
   *
   * @param user the user information, automatically injected by the @User() decorator
   * @param dto the transaction data, passed in the body of the request
   * @returns the newly created transaction
   */
  @Post()
  @Roles(UserRole.READ_WRITE, UserRole.STORE_ADMIN)
  async createTransaction(
    @User() user: IUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(user, dto);
  }

  /**
   * Returns a list of transactions for the store of the authenticated user, filtered according to the payload.
   *
   * @param user the user information, automatically injected by the @User() decorator
   * @param payload the filter data, passed in the body of the request
   * @returns the list of transactions, filtered according to the payload
   */
  @Post('search')
  async getTransactions(
    @User() user: IUser,
    @Body() payload: TransactionQueryDto,
  ) {
    return this.transactionService.getTransactions(
      user.storeId.toString(),
      payload,
    );
  }

  /**
   * Returns a weekly report of transactions for the store of the authenticated user.
   *
   * If a date is provided in the query, the report will be generated for the week
   * containing that date. Otherwise, the report will be generated for the current week.
   *
   * @param user the user information, automatically injected by the @User() decorator
   * @param date the date to generate the report for, if not provided the current week will be used
   * @returns the weekly report, containing the sum of transactions for each day of the week
   */
  @Get('reports/weekly')
  async getWeeklyReport(@User() user: IUser, @Query('date') date?: string) {
    return this.transactionService.generateReport(
      user.storeId.toString(),
      'week',
      date ? new Date(date) : new Date(),
    );
  }

  /**
   * Returns a monthly report of transactions for the store of the authenticated user.
   *
   * If a date is provided in the query, the report will be generated for the month
   * containing that date. Otherwise, the report will be generated for the current month.
   *
   * @param user the user information, automatically injected by the @User() decorator
   * @param date the date to generate the report for, if not provided the current month will be used
   * @returns the monthly report, containing the sum of transactions for each day of the month
   */
  @Get('reports/monthly')
  async getMonthlyReport(@User() user: IUser, @Query('date') date?: string) {
    return this.transactionService.generateReport(
      user.storeId.toString(),
      'month',
      date ? new Date(date) : new Date(),
    );
  }
}
