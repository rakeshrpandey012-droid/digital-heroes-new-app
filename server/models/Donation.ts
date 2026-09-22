import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDonation } from './types.ts';

export interface IDonationDocument extends Omit<IDonation, 'id'>, Document {
  id: string;
}

export const DonationSchema = new Schema<IDonationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    charityId: { type: String, required: true, index: true },
    charityName: { type: String, required: true },
    userId: { type: String },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    message: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },
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

export const DonationModel: Model<IDonationDocument> =
  mongoose.models.Donation || mongoose.model<IDonationDocument>('Donation', DonationSchema);

export default DonationModel;
