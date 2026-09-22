import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './types.ts';

export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  id: string;
}

export const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['public', 'subscriber', 'admin'], default: 'subscriber' },
    handicap: { type: Number, default: 18 },
    homeClub: { type: String, default: 'St. Andrews Links' },
    avatarUrl: { type: String, default: '' },
    subscription: {
      status: { type: String, enum: ['active', 'inactive', 'lapsed', 'none'], default: 'active' },
      plan: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
      amount: { type: Number, default: 29 },
      startDate: { type: String, default: () => new Date().toISOString() },
      renewalDate: { type: String, default: () => new Date(Date.now() + 30 * 86400000).toISOString() },
      stripeCustomerId: { type: String, default: '' },
    },
    charitySelection: {
      charityId: { type: String, required: true, default: 'charity-1' },
      charityName: { type: String, required: true, default: 'Fore Hope Veterans Foundation' },
      percentage: { type: Number, default: 15, min: 10, max: 100 },
    },
    paymentMethod: {
      type: { type: String, default: 'card' },
      brand: { type: String, default: 'Visa' },
      last4: { type: String, default: '4242' },
      expMonth: { type: String, default: '12' },
      expYear: { type: String, default: '2028' },
      cardholderName: { type: String, default: '' },
      paypalEmail: { type: String },
      bankName: { type: String },
      isDefault: { type: Boolean, default: true },
    },
    paymentMethods: [
      {
        type: { type: String, default: 'card' },
        brand: { type: String, default: 'Visa' },
        last4: { type: String, default: '4242' },
        expMonth: { type: String, default: '12' },
        expYear: { type: String, default: '2028' },
        cardholderName: { type: String, default: '' },
        paypalEmail: { type: String },
        bankName: { type: String },
        isDefault: { type: Boolean, default: true },
      },
    ],
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
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

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
