import mongoose, { Schema, Document, Model } from 'mongoose';
import { IScore } from './types.ts';

export interface IScoreDocument extends Omit<IScore, 'id'>, Document {
  id: string;
}

export const ScoreSchema = new Schema<IScoreDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    score: {
      type: Number,
      required: true,
      min: [1, 'Stableford score must be at least 1'],
      max: [45, 'Stableford score cannot exceed 45'],
    },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    courseName: { type: String, required: true, trim: true },
    holesPlayed: { type: Number, enum: [9, 18], default: 18 },
    notes: { type: String, default: '' },
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

// Create compound index for userId + date (helps enforce uniqueness & speedy lookup)
ScoreSchema.index({ userId: 1, date: 1 });

export const ScoreModel: Model<IScoreDocument> =
  mongoose.models.Score || mongoose.model<IScoreDocument>('Score', ScoreSchema);

export default ScoreModel;
