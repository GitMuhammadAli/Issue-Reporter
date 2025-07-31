import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IssueDocument = Issue & Document;

@Schema({ timestamps: true, autoIndex: true })
export class Issue {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

 @Prop({ enum: ['open', 'verified', 'closed'], default: 'open' })
status: string;

@Prop({ enum: ['user', 'admin'], default: 'user' })
role: string;

@Prop({ type: [String], default: [] })
mediaUrls: string[];

@Prop({ type: [String], default: [] })
  upvotes: string[];

   @Prop({ default: null })
  deletedAt: Date;


@Prop({ default: 0 })
upvotesCount: number;

}

export const IssueSchema = SchemaFactory.createForClass(Issue);
IssueSchema.index({ location: '2dsphere' });
