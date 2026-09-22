export type UserRole = 'public' | 'subscriber' | 'admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed' | 'none';

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface IPaymentMethodInfo {
  type: 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'bank_transfer';
  brand?: string;
  last4?: string;
  expMonth?: string;
  expYear?: string;
  cardholderName?: string;
  paypalEmail?: string;
  bankName?: string;
  isDefault?: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  handicap?: number;
  homeClub?: string;
  avatarUrl?: string;
  subscription: {
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    amount: number;
    startDate: string;
    renewalDate: string;
    stripeCustomerId?: string;
  };
  charitySelection: {
    charityId: string;
    charityName: string;
    percentage: number; // min 10
  };
  paymentMethod?: IPaymentMethodInfo;
  paymentMethods?: IPaymentMethodInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface IScore {
  id: string;
  userId: string;
  score: number; // 1 - 45 Stableford
  date: string; // YYYY-MM-DD
  courseName: string;
  holesPlayed: 9 | 18;
  notes?: string;
  createdAt: string;
}

export interface ICharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface ICharity {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  totalRaised: number;
  supporterCount: number;
  featured: boolean;
  impactStatement: string;
  upcomingEvents: ICharityEvent[];
  createdAt: string;
}

export type DrawLogic = 'random' | 'algorithmic';
export type DrawStatus = 'scheduled' | 'simulated' | 'published';

export interface IDrawTier {
  share: number; // 0.40, 0.35, 0.25
  poolAmount: number;
  winnersCount: number;
  perWinnerAmount: number;
  rollover: boolean;
}

export interface IDraw {
  id: string;
  month: string;
  status: DrawStatus;
  drawLogic: DrawLogic;
  scheduledDate: string;
  drawnDate: string | null;
  winningNumbers: number[];
  totalPool: number;
  rolloverAmount: number;
  tierAllocation: {
    match5: IDrawTier;
    match4: IDrawTier;
    match3: IDrawTier;
  };
  subscribersCount: number;
  createdAt: string;
}

export type WinnerVerificationStatus = 'pending' | 'approved' | 'rejected';
export type WinnerPayoutStatus = 'pending' | 'paid';

export interface IWinner {
  id: string;
  drawId: string;
  drawMonth: string;
  userId: string;
  userName: string;
  userEmail: string;
  matchType: '5-match' | '4-match' | '3-match';
  matchedNumbers: number[];
  userScores: number[];
  winningNumbers: number[];
  prizeAmount: number;
  proofUrl: string | null;
  proofNotes?: string;
  verificationStatus: WinnerVerificationStatus;
  adminNotes?: string;
  payoutStatus: WinnerPayoutStatus;
  payoutTransactionId: string | null;
  payoutDate: string | null;
  createdAt: string;
}

export interface IDonation {
  id: string;
  charityId: string;
  charityName: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}
