import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ITimestamps } from 'src/common/types/timestamp';
import { UserRole } from '../enums/roles';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: mongoose.Schema.ObjectId, auto: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: UserRole,
    required: false,
    default: [UserRole.READ_ONLY],
  })
  roles: UserRole[];

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  })
  storeId: mongoose.Types.ObjectId;

  @Prop({ required: false, default: true })
  active: boolean;

  @Prop()
  lastLoggedInAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type IUser = HydratedDocument<User> & ITimestamps;
