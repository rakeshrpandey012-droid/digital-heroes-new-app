export type UserRole = 'public' | 'subscriber' | 'admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed' | 'none';
export type SubscriptionPlan = 'monthly' | 'yearly';

export interface PaymentMethodInfo {
  type: 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'bank_transfer';
  brand?: string; // 'visa' | 'mastercard' | 'amex' | 'discover'
  last4?: string;
  expMonth?: string;
  expYear?: string;
  cardholderName?: string;
  paypalEmail?: string;
  bankName?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
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
    percentage: number;
  };
  paymentMethod?: PaymentMethodInfo;
  paymentMethods?: PaymentMethodInfo[];
  scores?: Score[];
  createdAt: string;
}

export interface Score {
  id: string;
  userId: string;
  score: number; // 1 - 45 Stableford
  date: string; // YYYY-MM-DD
  courseName: string;
  holesPlayed: 9 | 18;
  notes?: string;
  createdAt: string;
}

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Charity {
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
  isSpotlight?: boolean;
  impactStatement: string;
  websiteUrl?: string;
  upcomingEvents: CharityEvent[];
  createdAt: string;
}

export interface DrawTier {
  share: number;
  poolAmount: number;
  winnersCount: number;
  perWinnerAmount: number;
  rollover: boolean;
}

export interface Draw {
  id: string;
  month: string;
  status: 'scheduled' | 'simulated' | 'published';
  drawLogic: 'random' | 'algorithmic';
  scheduledDate: string;
  drawnDate: string | null;
  winningNumbers: number[];
  totalPool: number;
  rolloverAmount: number;
  tierAllocation: {
    match5: DrawTier;
    match4: DrawTier;
    match3: DrawTier;
  };
  subscribersCount: number;
  createdAt: string;
}

export interface Winner {
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
  verificationStatus: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  payoutStatus: 'pending' | 'paid';
  payoutTransactionId: string | null;
  payoutDate: string | null;
  createdAt: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  totalPrizePoolCurrent: number;
  totalPrizePoolHistory: number;
  totalPrizesPaid: number;
  totalCharityContributed: number;
  monthlyCharityRate: number;
  drawStatistics: {
    totalDrawsHeld: number;
    totalWinnersCount: number;
    pendingVerifications: number;
    currentJackpotRollover: number;
  };
  charityLeaderboard: Array<{
    id: string;
    name: string;
    totalRaised: number;
    supporters: number;
  }>;
}
