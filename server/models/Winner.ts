import mongoose, { Schema, Document, Model } from 'mongoose';
import { IWinner } from './types.ts';

export interface IWinnerDocument extends Omit<IWinner, 'id'>, Document {
  id: string;
}

export const WinnerSchema = new Schema<IWinnerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    drawId: { type: String, required: true, index: true },
    drawMonth: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    matchType: {
      type: String,
      enum: ['5-match', '4-match', '3-match'],
      required: true,
    },
    matchedNumbers: [{ type: Number }],
    userScores: [{ type: Number }],
    winningNumbers: [{ type: Number }],
    prizeAmount: { type: Number, required: true },
    proofUrl: { type: String, default: null },
    proofNotes: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    payoutStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
      index: true,
    },
    payoutTransactionId: { type: String, default: null },
    payoutDate: { type: String, default: null },
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

export const WinnerModel: Model<IWinnerDocument> =
  mongoose.models.Winner || mongoose.model<IWinnerDocument>('Winner', WinnerSchema);

export default WinnerModel;
