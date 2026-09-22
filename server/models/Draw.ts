import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDraw } from './types.ts';

export interface IDrawDocument extends Omit<IDraw, 'id'>, Document {
  id: string;
}

export const DrawSchema = new Schema<IDrawDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    month: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'simulated', 'published'],
      default: 'scheduled',
    },
    drawLogic: {
      type: String,
      enum: ['random', 'algorithmic'],
      default: 'algorithmic',
    },
    scheduledDate: { type: String, required: true },
    drawnDate: { type: String, default: null },
    winningNumbers: [{ type: Number, min: 1, max: 45 }],
    totalPool: { type: Number, required: true },
    rolloverAmount: { type: Number, default: 0 },
    tierAllocation: {
      match5: {
        share: { type: Number, default: 0.4 },
        poolAmount: { type: Number, default: 0 },
        winnersCount: { type: Number, default: 0 },
        perWinnerAmount: { type: Number, default: 0 },
        rollover: { type: Boolean, default: true },
      },
      match4: {
        share: { type: Number, default: 0.35 },
        poolAmount: { type: Number, default: 0 },
        winnersCount: { type: Number, default: 0 },
        perWinnerAmount: { type: Number, default: 0 },
        rollover: { type: Boolean, default: false },
      },
      match3: {
        share: { type: Number, default: 0.25 },
        poolAmount: { type: Number, default: 0 },
        winnersCount: { type: Number, default: 0 },
        perWinnerAmount: { type: Number, default: 0 },
        rollover: { type: Boolean, default: false },
      },
    },
    subscribersCount: { type: Number, default: 0 },
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

export const DrawModel: Model<IDrawDocument> =
  mongoose.models.Draw || mongoose.model<IDrawDocument>('Draw', DrawSchema);

export default DrawModel;
