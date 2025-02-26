import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Posts extends Document {
  @Prop({ required: true })
  entrepreneur: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: [
      'Technologie',
      'Santé',
      'Éducation',
      'Finance',
      'Environnement',
      'Industrie',
      'Autre',
    ],
  })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, min: 1000 })
  investmentGoal: number;

  @Prop({ default: 0 })
  currentInvestment: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({
    required: true,
    enum: ['Brouillon', 'Publié', 'Fermé'],
    default: 'Publié',
  })
  status: string;
}
export type PostsDocument = Posts;
export const PostsSchema = SchemaFactory.createForClass(Posts);
