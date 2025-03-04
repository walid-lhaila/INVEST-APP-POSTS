import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Favorite extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ type: Types.ObjectId, ref: 'Posts', required: true })
  post: Types.ObjectId;
}

export type FavoriteDocument = Favorite;
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
