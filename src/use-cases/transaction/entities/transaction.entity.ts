import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ITimestamps } from 'src/common/types/timestamp';
import { Currency } from '../enums/currency';
import { TransactionType } from '../enums/transaction';

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ type: mongoose.Schema.ObjectId, auto: true })
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  })
  storeId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: false })
  description?: string;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type: TransactionType;

  @Prop({ required: true, enum: Currency })
  currency: Currency;

  @Prop({ required: true })
  amountInINR: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: mongoose.Types.ObjectId;

  @Prop()
  createdAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
export type ITransaction = HydratedDocument<Transaction> & ITimestamps;
