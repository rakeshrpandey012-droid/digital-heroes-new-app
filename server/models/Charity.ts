import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICharity } from './types.ts';

export interface ICharityDocument extends Omit<ICharity, 'id'>, Document {
  id: string;
}

export const CharitySchema = new Schema<ICharityDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Veterans & First Responders',
        'Youth Athletic Grants',
        'Cancer Research & Care',
        'Mental Health Support',
        'Adaptive Sports',
      ],
    },
    logoUrl: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    totalRaised: { type: Number, default: 0 },
    supporterCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    impactStatement: { type: String, required: true },
    upcomingEvents: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        date: { type: String, required: true },
        location: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        if (!ret.id && ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CharityModel: Model<ICharityDocument> =
  mongoose.models.Charity || mongoose.model<ICharityDocument>('Charity', CharitySchema);

export default CharityModel;
