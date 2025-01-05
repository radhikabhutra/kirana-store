import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { StoreAddress } from '../dtos/store.dto';

@Schema({ timestamps: true, collection: 'stores' })
export class Store {
  @Prop({ type: mongoose.Schema.ObjectId, auto: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  adminId: mongoose.Types.ObjectId;

  @Prop({ type: StoreAddress })
  address: StoreAddress;

  @Prop({ default: true })
  active: boolean;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
