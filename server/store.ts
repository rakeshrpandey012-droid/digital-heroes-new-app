import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, isDbConnected, getDatabaseStatus } from './db.ts';
import { UserModel } from './models/User.ts';
import { CharityModel } from './models/Charity.ts';
import { ScoreModel } from './models/Score.ts';
import { DrawModel } from './models/Draw.ts';
import { WinnerModel } from './models/Winner.ts';
import { DonationModel } from './models/Donation.ts';
import {
  IUser,
  IScore,
  ICharity,
  IDraw,
  IWinner,
  IDonation,
  DrawLogic,
} from './models/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'digitalheroes-production-jwt-secret-key-2026';

// Initial Seeds for MongoDB Atlas initial provisioning
const initialCharities: ICharity[] = [
  {
    id: 'charity-1',
    name: 'Fore Hope Veterans Foundation',
    tagline: 'Therapeutic adaptive golf & reintegration for combat veterans and first responders.',
    description:
      'Empowering service-disabled veterans through adaptive golf clinics, neurological recovery programs, and community fellowship. We provide custom adaptive mobility equipment and professional instruction to restore confidence and physical vitality.',
    category: 'Veterans & First Responders',
    logoUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    totalRaised: 148500,
    supporterCount: 1420,
    featured: true,
    impactStatement: 'Over 850 veterans enrolled in certified rehabilitation programs across 18 regional training centers in 2025.',
    upcomingEvents: [
      {
        id: 'event-1',
        title: 'Valor Cup Charity Invitational',
        date: '2026-05-14',
        location: 'Whispering Pines Golf Club, TX',
        description: '36-hole team scramble pairing civilian donors with wounded veterans, followed by an evening banquet and silent auction.',
      },
      {
        id: 'event-2',
        title: 'Spring Adaptive Equipment Clinic',
        date: '2026-06-20',
        location: 'Torrey Pines South, CA',
        description: 'Hands-on clinic introducing SoloRider motorized mobility carts and tailored grip technologies for amputee athletes.',
      },
    ],
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'charity-2',
    name: 'NextGen Fairway Grants',
    tagline: 'Removing financial barriers for underrepresented youth golfers.',
    description:
      'Providing elite tournament sponsorship, equipment stipends, and academic tutoring for youth from underserved urban districts to access collegiate golf scholarships.',
    category: 'Youth Athletic Grants',
    logoUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80',
    totalRaised: 94200,
    supporterCount: 890,
    featured: true,
    impactStatement: '120 junior scholars funded with full gear sets, 14 received Division 1 & 2 college scholarship offers.',
    upcomingEvents: [
      {
        id: 'event-3',
        title: 'NextGen Futures Pro-Am',
        date: '2026-04-28',
        location: 'East Lake Golf Club, Atlanta',
        description: 'Youth scholarship recipients paired with touring professionals for a 9-hole exhibition match.',
      },
    ],
    createdAt: new Date('2025-02-15').toISOString(),
  },
  {
    id: 'charity-3',
    name: 'Pulse Oncology Research Alliance',
    tagline: 'Funding groundbreaking genomic research to defeat pediatric cancers.',
    description:
      'Direct grant allocation to premier cancer research centers developing targeted immunotherapies with minimal toxicity for children and young adults.',
    category: 'Cancer Research & Care',
    logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    totalRaised: 212000,
    supporterCount: 2340,
    featured: false,
    impactStatement: '$1.4M awarded to dual clinical trials advancing personalized cellular therapy.',
    upcomingEvents: [
      {
        id: 'event-4',
        title: 'Fairways for a Cure Gala & Scramble',
        date: '2026-07-12',
        location: 'Medinah Country Club, IL',
        description: 'Annual flagship fundraiser featuring high-stakes hole-in-one challenges, keynotes by leading oncologists, and live charity draw.',
      },
    ],
    createdAt: new Date('2025-01-10').toISOString(),
  },
  {
    id: 'charity-4',
    name: 'MindFairway Mental Health Initiative',
    tagline: 'De-stigmatizing athlete mental health through mindful outdoor sports therapy.',
    description:
      'Delivering trauma-informed outdoor mental wellness retreats, peer-support networks, and 24/7 crisis lines tailored to competitive athletes and young adults under severe performance pressure.',
    category: 'Mental Health Support',
    logoUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    totalRaised: 68400,
    supporterCount: 615,
    featured: false,
    impactStatement: 'Over 4,200 hours of 1-on-1 counseling and 26 regional nature mindfulness workshops provided free of charge.',
    upcomingEvents: [
      {
        id: 'event-5',
        title: 'Mindful 100 Holes Endurance Walk',
        date: '2026-08-05',
        location: 'Bandon Dunes, OR',
        description: 'A sunrise-to-sunset marathon walk emphasizing physical endurance, mental resilience, and donor pledge matching.',
      },
    ],
    createdAt: new Date('2025-03-01').toISOString(),
  },
  {
    id: 'charity-5',
    name: 'All-Abilities Swing Project',
    tagline: 'Universal accessibility modifications for municipal courses & adaptive golfers.',
    description:
      'Retrofitting public municipal courses with wheelchair-accessible bunkers, tactile tee markers for visually impaired golfers, and specialized adaptive coaches.',
    category: 'Adaptive Sports',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    totalRaised: 81300,
    supporterCount: 750,
    featured: false,
    impactStatement: '32 public courses upgraded with ADA-certified adaptive tee ramps and certified disability instructors.',
    upcomingEvents: [
      {
        id: 'event-6',
        title: 'Open Greens Adaptive Championship',
        date: '2026-09-19',
        location: 'Chambers Bay, WA',
        description: 'Nationwide showcase for para-golfers across seated, visual, and standing classifications.',
      },
    ],
    createdAt: new Date('2025-03-10').toISOString(),
  },
];

class MongoStore {
  users: Map<string, IUser> = new Map();
  scores: Map<string, IScore> = new Map();
  charities: Map<string, ICharity> = new Map();
  draws: Map<string, IDraw> = new Map();
  winners: Map<string, IWinner> = new Map();
  donations: Map<string, IDonation> = new Map();
  isInitialized = false;

  constructor() {
    // Populate in-memory defaults synchronously so startup is never blocked
    this.seedDefaultsInMemory();
  }

  seedDefaultsInMemory() {
    for (const c of initialCharities) {
      this.charities.set(c.id, c);
    }

    const salt = bcrypt.genSaltSync(10);
    const subscriberPass = bcrypt.hashSync('Password123!', salt);
    const adminPass = bcrypt.hashSync('AdminPass123!', salt);

    const subscriberUser: IUser = {
      id: 'usr-subscriber-01',
      name: 'Marcus Vance',
      email: 'subscriber@digitalheroes.com',
      password: subscriberPass,
      role: 'subscriber',
      handicap: 14.2,
      homeClub: 'Spyglass Dunes Links',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      subscription: {
        status: 'active',
        plan: 'yearly',
        amount: 290,
        startDate: '2025-01-15T00:00:00.000Z',
        renewalDate: '2027-01-15T00:00:00.000Z',
        stripeCustomerId: 'cus_sub_98124_live',
      },
      charitySelection: {
        charityId: 'charity-1',
        charityName: 'Fore Hope Veterans Foundation',
        percentage: 20,
      },
      paymentMethod: {
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expMonth: '12',
        expYear: '2028',
        cardholderName: 'Marcus Vance',
        isDefault: true,
      },
      paymentMethods: [
        {
          type: 'card',
          brand: 'Visa',
          last4: '4242',
          expMonth: '12',
          expYear: '2028',
          cardholderName: 'Marcus Vance',
          isDefault: true,
        },
      ],
      createdAt: '2025-01-15T10:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
    this.users.set(subscriberUser.id, subscriberUser);

    const adminUser: IUser = {
      id: 'usr-admin-01',
      name: 'Elena Vance-Hayes (Operations Lead)',
      email: 'admin@digitalheroes.com',
      password: adminPass,
      role: 'admin',
      handicap: 8.4,
      homeClub: 'St. Andrews Royal',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      subscription: {
        status: 'active',
        plan: 'yearly',
        amount: 290,
        startDate: '2024-01-01T00:00:00.000Z',
        renewalDate: '2027-01-01T00:00:00.000Z',
      },
      charitySelection: {
        charityId: 'charity-3',
        charityName: 'Pulse Oncology Research Alliance',
        percentage: 30,
      },
      createdAt: '2024-01-01T08:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);

    const mockSubscribers = [
      { id: 'usr-mock-02', name: 'Devon Reed', email: 'devon.r@example.com', scores: [34, 38, 41, 29, 36], charity: 'charity-1' },
      { id: 'usr-mock-03', name: 'Sophia Chen', email: 'sophia.c@example.com', scores: [38, 42, 35, 33, 40], charity: 'charity-2' },
      { id: 'usr-mock-04', name: 'Liam Gallagher', email: 'liam.g@example.com', scores: [31, 39, 42, 36, 38], charity: 'charity-1' },
      { id: 'usr-mock-05', name: 'Zara Al-Mansoor', email: 'zara.m@example.com', scores: [40, 36, 37, 43, 35], charity: 'charity-3' },
      { id: 'usr-mock-06', name: 'Kip Thorne', email: 'kip.t@example.com', scores: [28, 32, 36, 40, 38], charity: 'charity-4' },
      { id: 'usr-mock-07', name: 'Nadia Petrov', email: 'nadia.p@example.com', scores: [41, 35, 38, 39, 44], charity: 'charity-5' },
      { id: 'usr-mock-08', name: 'Caleb Morgan', email: 'caleb.m@example.com', scores: [33, 37, 34, 40, 38], charity: 'charity-2' },
      { id: 'usr-mock-09', name: 'Aria Sterling', email: 'aria.s@example.com', scores: [36, 38, 41, 42, 35], charity: 'charity-1' },
    ];

    for (const sub of mockSubscribers) {
      const u: IUser = {
        id: sub.id,
        name: sub.name,
        email: sub.email,
        password: subscriberPass,
        role: 'subscriber',
        handicap: 12.0,
        homeClub: 'Metro Highlands GC',
        subscription: {
          status: 'active',
          plan: 'monthly',
          amount: 29,
          startDate: '2026-01-01T00:00:00.000Z',
          renewalDate: '2026-04-01T00:00:00.000Z',
        },
        charitySelection: {
          charityId: sub.charity,
          charityName: this.charities.get(sub.charity)?.name || 'Charity',
          percentage: 15,
        },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      };
      this.users.set(u.id, u);

      sub.scores.forEach((sc, idx) => {
        const d = new Date(Date.now() - (idx + 1) * 6 * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const scoreId = `sc-${sub.id}-${idx}`;
        this.scores.set(scoreId, {
          id: scoreId,
          userId: sub.id,
          score: sc,
          date: dateStr,
          courseName: 'Championship Valley 18',
          holesPlayed: 18,
          createdAt: d.toISOString(),
        });
      });
    }

    const marcusScores = [
      { score: 42, date: '2026-03-18', course: 'Pebble Ridge Coastal Links', holes: 18, notes: 'Career best round, 5 birdies in back nine' },
      { score: 38, date: '2026-03-12', course: 'Torrey Cliffs Championship', holes: 18, notes: 'Solid scramble finish under high wind' },
      { score: 40, date: '2026-03-05', course: 'Spyglass Dunes West', holes: 18, notes: 'Flawless putting on bentgrass greens' },
      { score: 36, date: '2026-02-27', course: 'Pacific Heights Meadow', holes: 18, notes: 'Steady fairway regulation' },
      { score: 34, date: '2026-02-18', course: 'Olympic Valley Pines', holes: 18, notes: 'Challenging pin placements' },
    ];

    marcusScores.forEach((s, idx) => {
      const id = `score-marcus-${idx + 1}`;
      this.scores.set(id, {
        id,
        userId: 'usr-subscriber-01',
        score: s.score,
        date: s.date,
        courseName: s.course,
        holesPlayed: s.holes as 18,
        notes: s.notes,
        createdAt: new Date(s.date + 'T12:00:00.000Z').toISOString(),
      });
    });

    const febWinningNumbers = [34, 38, 40, 42, 17];
    const febDraw: IDraw = {
      id: 'draw-2026-02',
      month: 'February 2026',
      status: 'published',
      drawLogic: 'algorithmic',
      scheduledDate: '2026-02-28T20:00:00.000Z',
      drawnDate: '2026-02-28T20:05:12.000Z',
      winningNumbers: febWinningNumbers,
      totalPool: 20000,
      rolloverAmount: 0,
      tierAllocation: {
        match5: { share: 0.4, poolAmount: 8000, winnersCount: 0, perWinnerAmount: 0, rollover: true },
        match4: { share: 0.35, poolAmount: 7000, winnersCount: 2, perWinnerAmount: 3500, rollover: false },
        match3: { share: 0.25, poolAmount: 5000, winnersCount: 5, perWinnerAmount: 1000, rollover: false },
      },
      subscribersCount: 840,
      createdAt: '2026-02-01T00:00:00.000Z',
    };
    this.draws.set(febDraw.id, febDraw);

    const marchDraw: IDraw = {
      id: 'draw-2026-03',
      month: 'March 2026',
      status: 'scheduled',
      drawLogic: 'algorithmic',
      scheduledDate: '2026-03-31T20:00:00.000Z',
      drawnDate: null,
      winningNumbers: [],
      totalPool: 28500,
      rolloverAmount: 8000,
      tierAllocation: {
        match5: { share: 0.4, poolAmount: 11400 + 8000, winnersCount: 0, perWinnerAmount: 0, rollover: true },
        match4: { share: 0.35, poolAmount: 9975, winnersCount: 0, perWinnerAmount: 0, rollover: false },
        match3: { share: 0.25, poolAmount: 7125, winnersCount: 0, perWinnerAmount: 0, rollover: false },
      },
      subscribersCount: 1120,
      createdAt: '2026-03-01T00:00:00.000Z',
    };
    this.draws.set(marchDraw.id, marchDraw);

    const marcusWinner: IWinner = {
      id: 'win-marcus-feb2026',
      drawId: 'draw-2026-02',
      drawMonth: 'February 2026',
      userId: 'usr-subscriber-01',
      userName: 'Marcus Vance',
      userEmail: 'subscriber@digitalheroes.com',
      matchType: '4-match',
      matchedNumbers: [34, 38, 40, 42],
      userScores: [42, 38, 40, 36, 34],
      winningNumbers: febWinningNumbers,
      prizeAmount: 3500,
      proofUrl: null,
      proofNotes: '',
      verificationStatus: 'pending',
      adminNotes: 'Awaiting official screenshot confirmation from World Handicap System / Golf Genius',
      payoutStatus: 'pending',
      payoutTransactionId: null,
      payoutDate: null,
      createdAt: '2026-02-28T20:10:00.000Z',
    };
    this.winners.set(marcusWinner.id, marcusWinner);

    const sophiaWinner: IWinner = {
      id: 'win-sophia-feb2026',
      drawId: 'draw-2026-02',
      drawMonth: 'February 2026',
      userId: 'usr-mock-03',
      userName: 'Sophia Chen',
      userEmail: 'sophia.c@example.com',
      matchType: '4-match',
      matchedNumbers: [38, 42, 34, 40],
      userScores: [38, 42, 35, 33, 40],
      winningNumbers: febWinningNumbers,
      prizeAmount: 3500,
      proofUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      proofNotes: 'Official GHIN scorecard verified #84920491',
      verificationStatus: 'approved',
      adminNotes: 'Verified against GHIN handicap record by Elena V. on March 2nd.',
      payoutStatus: 'paid',
      payoutTransactionId: 'TX_STRIPE_PAY_982410',
      payoutDate: '2026-03-03T14:32:00.000Z',
      createdAt: '2026-02-28T20:10:00.000Z',
    };
    this.winners.set(sophiaWinner.id, sophiaWinner);

    const donation1: IDonation = {
      id: 'don-01',
      charityId: 'charity-1',
      charityName: 'Fore Hope Veterans Foundation',
      userId: 'usr-subscriber-01',
      donorName: 'Marcus Vance',
      donorEmail: 'subscriber@digitalheroes.com',
      amount: 150,
      message: 'Keep championing our brothers and sisters in arms!',
      isAnonymous: false,
      createdAt: '2026-03-01T15:00:00.000Z',
    };
    this.donations.set(donation1.id, donation1);
  }

  /**
   * Initializes MongoDB Atlas connection and seeds database if collections are empty.
   * Then loads persistent data into memory for rapid read access.
   */
  async init(): Promise<void> {
    try {
      await connectDB();
      console.log('[Store] Synchronizing with MongoDB Atlas...');

      // 1. Charities
      const charityCount = await CharityModel.countDocuments();
      if (charityCount === 0) {
        console.log('[Store] Seeding initial Charities into MongoDB Atlas...');
        await CharityModel.insertMany(initialCharities);
      } else {
        const dbCharities = await CharityModel.find().lean();
        this.charities.clear();
        for (const c of dbCharities) {
          this.charities.set(c.id, c as unknown as ICharity);
        }
      }

      // 2. Users
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('[Store] Seeding initial Users into MongoDB Atlas...');
        const usersArray = Array.from(this.users.values());
        await UserModel.insertMany(usersArray);
      } else {
        const dbUsers = await UserModel.find().lean();
        this.users.clear();
        for (const u of dbUsers) {
          this.users.set(u.id, u as unknown as IUser);
        }
      }

      // 3. Scores
      const scoreCount = await ScoreModel.countDocuments();
      if (scoreCount === 0) {
        console.log('[Store] Seeding initial Scores into MongoDB Atlas...');
        const scoresArray = Array.from(this.scores.values());
        await ScoreModel.insertMany(scoresArray);
      } else {
        const dbScores = await ScoreModel.find().lean();
        this.scores.clear();
        for (const s of dbScores) {
          this.scores.set(s.id, s as unknown as IScore);
        }
      }

      // 4. Draws
      const drawCount = await DrawModel.countDocuments();
      if (drawCount === 0) {
        console.log('[Store] Seeding initial Draws into MongoDB Atlas...');
        const drawsArray = Array.from(this.draws.values());
        await DrawModel.insertMany(drawsArray);
      } else {
        const dbDraws = await DrawModel.find().lean();
        this.draws.clear();
        for (const d of dbDraws) {
          this.draws.set(d.id, d as unknown as IDraw);
        }
      }

      // 5. Winners
      const winnerCount = await WinnerModel.countDocuments();
      if (winnerCount === 0) {
        console.log('[Store] Seeding initial Winners into MongoDB Atlas...');
        const winnersArray = Array.from(this.winners.values());
        await WinnerModel.insertMany(winnersArray);
      } else {
        const dbWinners = await WinnerModel.find().lean();
        this.winners.clear();
        for (const w of dbWinners) {
          this.winners.set(w.id, w as unknown as IWinner);
        }
      }

      // 6. Donations
      const donationCount = await DonationModel.countDocuments();
      if (donationCount === 0) {
        console.log('[Store] Seeding initial Donations into MongoDB Atlas...');
        const donationsArray = Array.from(this.donations.values());
        await DonationModel.insertMany(donationsArray);
      } else {
        const dbDonations = await DonationModel.find().lean();
        this.donations.clear();
        for (const don of dbDonations) {
          this.donations.set(don.id, don as unknown as IDonation);
        }
      }

      this.isInitialized = true;
      console.log(
        `[Store] ✅ Database sync complete! Loaded from Atlas: ${this.users.size} users, ${this.charities.size} charities, ${this.scores.size} scores, ${this.draws.size} draws, ${this.winners.size} winners, ${this.donations.size} donations.`
      );
    } catch (err: any) {
      console.error('[Store] ⚠️ Error during Atlas initialization:', err.message || err);
      // Fallback: store operates with in-memory seeded records while attempting background reconnection
    }
  }

  // --- Auth & JWT Helpers ---
  signToken(user: IUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionStatus: user.subscription.status,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  // --- User Methods ---
  getUserById(id: string): IUser | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): IUser | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return undefined;
  }

  getAllUsers(): IUser[] {
    return Array.from(this.users.values()).map((u) => {
      const { password, ...safe } = u;
      return safe as IUser;
    });
  }

  createUser(userData: Partial<IUser>): IUser {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const defaultCharity =
      this.charities.get(userData.charitySelection?.charityId || 'charity-1') || initialCharities[0];

    const newUser: IUser = {
      id,
      name: userData.name || 'Golf Enthusiast',
      email: userData.email!.toLowerCase(),
      password: userData.password,
      role: userData.role || 'subscriber',
      handicap: userData.handicap || 18,
      homeClub: userData.homeClub || 'Municipal Links',
      avatarUrl: userData.avatarUrl || '',
      subscription: {
        status: userData.subscription?.status || 'active',
        plan: userData.subscription?.plan || 'monthly',
        amount: userData.subscription?.plan === 'yearly' ? 290 : 29,
        startDate: now,
        renewalDate: new Date(
          Date.now() + (userData.subscription?.plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
      },
      charitySelection: {
        charityId: defaultCharity.id,
        charityName: defaultCharity.name,
        percentage: Math.max(10, userData.charitySelection?.percentage || 15),
      },
      paymentMethod: userData.paymentMethod || {
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expMonth: '12',
        expYear: '2028',
        cardholderName: userData.name || 'Member',
        isDefault: true,
      },
      paymentMethods: userData.paymentMethods || [
        userData.paymentMethod || {
          type: 'card',
          brand: 'Visa',
          last4: '4242',
          expMonth: '12',
          expYear: '2028',
          cardholderName: userData.name || 'Member',
          isDefault: true,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, newUser);

    // Save directly to MongoDB Atlas
    UserModel.create(newUser).catch((err) => {
      console.error('[MongoDB Error] Failed to persist user to Atlas:', err.message || err);
    });

    return newUser;
  }

  updateUser(id: string, updates: Partial<IUser>): IUser | null {
    const user = this.users.get(id);
    if (!user) return null;

    if (updates.name) user.name = updates.name;
    if (updates.handicap !== undefined) user.handicap = updates.handicap;
    if (updates.homeClub) user.homeClub = updates.homeClub;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    if (updates.role) user.role = updates.role;

    if (updates.subscription) {
      user.subscription = {
        ...user.subscription,
        ...updates.subscription,
      };
    }

    if (updates.charitySelection) {
      user.charitySelection = {
        ...user.charitySelection,
        ...updates.charitySelection,
        percentage: Math.max(10, updates.charitySelection.percentage ?? user.charitySelection.percentage),
      };
    }

    if (updates.paymentMethod) {
      user.paymentMethod = updates.paymentMethod;
    }

    if (updates.paymentMethods) {
      user.paymentMethods = updates.paymentMethods;
    }

    user.updatedAt = new Date().toISOString();
    this.users.set(id, user);

    // Persist to MongoDB Atlas
    UserModel.findOneAndUpdate({ id }, user, { upsert: true }).catch((err) => {
      console.error('[MongoDB Error] Failed to update user in Atlas:', err.message || err);
    });

    return user;
  }

  // --- Score Methods (Strict PRD Compliance) ---
  getUserScores(userId: string): IScore[] {
    const userScores: IScore[] = [];
    for (const sc of this.scores.values()) {
      if (sc.userId === userId) {
        userScores.push(sc);
      }
    }
    return userScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addScore(
    userId: string,
    data: { score: number; date: string; courseName: string; holesPlayed?: 9 | 18; notes?: string }
  ): { error?: string; score?: IScore } {
    const scoreNum = Number(data.score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return { error: 'Stableford score must be a number between 1 and 45.' };
    }

    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return { error: 'A valid date in YYYY-MM-DD format is required.' };
    }

    const existing = this.getUserScores(userId);
    const duplicate = existing.find((s) => s.date === data.date);
    if (duplicate) {
      return {
        error: `A score for ${data.date} already exists (${duplicate.score} pts at ${duplicate.courseName}). Please edit or delete that entry instead.`,
      };
    }

    // Rolling 5-score FIFO rule: If 5 or more exist, remove the oldest chronologically
    if (existing.length >= 5) {
      const sortedAsc = [...existing].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const oldest = sortedAsc[0];
      this.scores.delete(oldest.id);
      ScoreModel.findOneAndDelete({ id: oldest.id }).catch((err) => {
        console.error('[MongoDB Error] Failed to delete rolled-over score from Atlas:', err.message || err);
      });
    }

    const newScore: IScore = {
      id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      score: scoreNum,
      date: data.date,
      courseName: data.courseName || 'Links Course',
      holesPlayed: data.holesPlayed || 18,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.scores.set(newScore.id, newScore);

    // Persist to MongoDB Atlas
    ScoreModel.create(newScore).catch((err) => {
      console.error('[MongoDB Error] Failed to insert score in Atlas:', err.message || err);
    });

    return { score: newScore };
  }

  updateScore(
    scoreId: string,
    userId: string,
    data: { score?: number; date?: string; courseName?: string; holesPlayed?: 9 | 18; notes?: string }
  ): { error?: string; score?: IScore } {
    const sc = this.scores.get(scoreId);
    if (!sc) return { error: 'Score not found' };
    if (sc.userId !== userId) return { error: 'Unauthorized to edit this score' };

    if (data.score !== undefined) {
      const num = Number(data.score);
      if (isNaN(num) || num < 1 || num > 45) {
        return { error: 'Stableford score must be between 1 and 45.' };
      }
      sc.score = num;
    }

    if (data.date && data.date !== sc.date) {
      const existing = this.getUserScores(userId);
      const duplicate = existing.find((s) => s.date === data.date && s.id !== scoreId);
      if (duplicate) {
        return { error: `Another score on ${data.date} already exists.` };
      }
      sc.date = data.date;
    }

    if (data.courseName) sc.courseName = data.courseName;
    if (data.holesPlayed) sc.holesPlayed = data.holesPlayed;
    if (data.notes !== undefined) sc.notes = data.notes;

    this.scores.set(scoreId, sc);

    ScoreModel.findOneAndUpdate({ id: scoreId }, sc).catch((err) => {
      console.error('[MongoDB Error] Failed to update score in Atlas:', err.message || err);
    });

    return { score: sc };
  }

  deleteScore(scoreId: string, userId: string): boolean {
    const sc = this.scores.get(scoreId);
    if (!sc) return false;
    if (sc.userId !== userId) return false;

    this.scores.delete(scoreId);

    ScoreModel.findOneAndDelete({ id: scoreId, userId }).catch((err) => {
      console.error('[MongoDB Error] Failed to delete score in Atlas:', err.message || err);
    });

    return true;
  }

  // --- Charity Methods ---
  getAllCharities(): ICharity[] {
    return Array.from(this.charities.values());
  }

  getCharityById(id: string): ICharity | undefined {
    return this.charities.get(id);
  }

  addCharity(data: Partial<ICharity>): ICharity {
    const id = `charity-${Date.now()}`;
    const newCharity: ICharity = {
      id,
      name: data.name || 'New Charity Partner',
      tagline: data.tagline || 'Supporting our athletic communities.',
      description: data.description || '',
      category: data.category || 'Youth Athletic Grants',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=400&q=80',
      bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      totalRaised: 0,
      supporterCount: 0,
      featured: Boolean(data.featured),
      impactStatement: data.impactStatement || 'Direct community benefit.',
      upcomingEvents: data.upcomingEvents || [],
      createdAt: new Date().toISOString(),
    };

    this.charities.set(id, newCharity);

    CharityModel.create(newCharity).catch((err) => {
      console.error('[MongoDB Error] Failed to create charity in Atlas:', err.message || err);
    });

    return newCharity;
  }

  updateCharity(id: string, data: Partial<ICharity>): ICharity | null {
    const c = this.charities.get(id);
    if (!c) return null;
    Object.assign(c, data);
    this.charities.set(id, c);

    CharityModel.findOneAndUpdate({ id }, c).catch((err) => {
      console.error('[MongoDB Error] Failed to update charity in Atlas:', err.message || err);
    });

    return c;
  }

  deleteCharity(id: string): boolean {
    const removed = this.charities.delete(id);
    if (removed) {
      CharityModel.findOneAndDelete({ id }).catch((err) => {
        console.error('[MongoDB Error] Failed to delete charity from Atlas:', err.message || err);
      });
    }
    return removed;
  }

  addDonation(data: {
    charityId: string;
    amount: number;
    donorName: string;
    donorEmail: string;
    message?: string;
    isAnonymous?: boolean;
    userId?: string;
  }): IDonation {
    const charity = this.charities.get(data.charityId);
    const donation: IDonation = {
      id: `don-${Date.now()}`,
      charityId: data.charityId,
      charityName: charity ? charity.name : 'Charity',
      userId: data.userId,
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      amount: Number(data.amount),
      message: data.message,
      isAnonymous: Boolean(data.isAnonymous),
      createdAt: new Date().toISOString(),
    };

    this.donations.set(donation.id, donation);

    DonationModel.create(donation).catch((err) => {
      console.error('[MongoDB Error] Failed to save donation in Atlas:', err.message || err);
    });

    if (charity) {
      charity.totalRaised += donation.amount;
      charity.supporterCount += 1;
      this.charities.set(charity.id, charity);

      CharityModel.findOneAndUpdate(
        { id: charity.id },
        { totalRaised: charity.totalRaised, supporterCount: charity.supporterCount }
      ).catch((err) => {
        console.error('[MongoDB Error] Failed to update charity raised in Atlas:', err.message || err);
      });
    }

    return donation;
  }

  // --- Draw & Reward Engine (PRD Compliance §06 & §07) ---
  generateDrawNumbers(logic: DrawLogic): number[] {
    if (logic === 'random') {
      const numbers = new Set<number>();
      while (numbers.size < 5) {
        const rand = Math.floor(Math.random() * 45) + 1;
        numbers.add(rand);
      }
      return Array.from(numbers).sort((a, b) => a - b);
    } else {
      const freqMap: { [score: number]: number } = {};
      for (let i = 1; i <= 45; i++) freqMap[i] = 1;

      for (const sc of this.scores.values()) {
        const u = this.users.get(sc.userId);
        if (u && u.subscription.status === 'active') {
          freqMap[sc.score] = (freqMap[sc.score] || 1) + 3;
        }
      }

      const weightedList: number[] = [];
      for (const [scoreStr, weight] of Object.entries(freqMap)) {
        const score = Number(scoreStr);
        for (let w = 0; w < weight; w++) {
          weightedList.push(score);
        }
      }

      const picked = new Set<number>();
      let attempts = 0;
      while (picked.size < 5 && attempts < 1000) {
        attempts++;
        const randIndex = Math.floor(Math.random() * weightedList.length);
        picked.add(weightedList[randIndex]);
      }
      while (picked.size < 5) {
        picked.add(Math.floor(Math.random() * 45) + 1);
      }
      return Array.from(picked).sort((a, b) => a - b);
    }
  }

  simulateDraw(
    drawId: string,
    logic?: DrawLogic
  ): {
    winningNumbers: number[];
    drawLogic: DrawLogic;
    totalPool: number;
    rolloverAmount: number;
    tiers: {
      match5: { pool: number; winners: Array<{ userId: string; name: string; email: string; matched: number[] }>; perWinner: number; rollover: boolean };
      match4: { pool: number; winners: Array<{ userId: string; name: string; email: string; matched: number[] }>; perWinner: number };
      match3: { pool: number; winners: Array<{ userId: string; name: string; email: string; matched: number[] }>; perWinner: number };
    };
    activeSubscribersCount: number;
  } {
    const draw = this.draws.get(drawId) || Array.from(this.draws.values())[0];
    const usedLogic = logic || draw.drawLogic || 'algorithmic';
    const winningNumbers = this.generateDrawNumbers(usedLogic);

    const activeSubscribers = Array.from(this.users.values()).filter((u) => u.subscription.status === 'active');
    const subscriberCount = activeSubscribers.length;

    const totalPool = Math.max(draw.totalPool, subscriberCount * 25 + draw.rolloverAmount);
    const rollover = draw.rolloverAmount || 0;

    const pool5 = Math.round(totalPool * 0.4);
    const pool4 = Math.round(totalPool * 0.35);
    const pool3 = Math.round(totalPool * 0.25);

    const winners5: Array<{ userId: string; name: string; email: string; matched: number[]; userScores: number[] }> = [];
    const winners4: Array<{ userId: string; name: string; email: string; matched: number[]; userScores: number[] }> = [];
    const winners3: Array<{ userId: string; name: string; email: string; matched: number[]; userScores: number[] }> = [];

    for (const sub of activeSubscribers) {
      const scores = this.getUserScores(sub.id).map((s) => s.score);
      if (scores.length === 0) continue;

      const matched = scores.filter((num) => winningNumbers.includes(num));
      const uniqueMatched = Array.from(new Set(matched));

      if (uniqueMatched.length >= 5) {
        winners5.push({ userId: sub.id, name: sub.name, email: sub.email, matched: uniqueMatched, userScores: scores });
      } else if (uniqueMatched.length === 4) {
        winners4.push({ userId: sub.id, name: sub.name, email: sub.email, matched: uniqueMatched, userScores: scores });
      } else if (uniqueMatched.length === 3) {
        winners3.push({ userId: sub.id, name: sub.name, email: sub.email, matched: uniqueMatched, userScores: scores });
      }
    }

    return {
      winningNumbers,
      drawLogic: usedLogic,
      totalPool,
      rolloverAmount: rollover,
      tiers: {
        match5: {
          pool: pool5,
          winners: winners5,
          perWinner: winners5.length > 0 ? Math.round(pool5 / winners5.length) : 0,
          rollover: winners5.length === 0,
        },
        match4: {
          pool: pool4,
          winners: winners4,
          perWinner: winners4.length > 0 ? Math.round(pool4 / winners4.length) : 0,
        },
        match3: {
          pool: pool3,
          winners: winners3,
          perWinner: winners3.length > 0 ? Math.round(pool3 / winners3.length) : 0,
        },
      },
      activeSubscribersCount: subscriberCount,
    };
  }

  addDraw(data: { month: string; totalPool?: number; rolloverAmount?: number; drawLogic?: DrawLogic }): IDraw {
    const id = `draw-${Date.now()}`;
    const pool = Number(data.totalPool) || 30000;
    const rollover = Number(data.rolloverAmount) || 8000;
    const logic = data.drawLogic || 'algorithmic';

    const newDraw: IDraw = {
      id,
      month: data.month,
      status: 'scheduled',
      drawLogic: logic,
      scheduledDate: new Date().toISOString(),
      drawnDate: null,
      winningNumbers: [],
      totalPool: pool,
      rolloverAmount: rollover,
      tierAllocation: {
        match5: { share: 0.4, poolAmount: pool * 0.4, winnersCount: 0, perWinnerAmount: 0, rollover: true },
        match4: { share: 0.35, poolAmount: pool * 0.35, winnersCount: 0, perWinnerAmount: 0, rollover: false },
        match3: { share: 0.25, poolAmount: pool * 0.25, winnersCount: 0, perWinnerAmount: 0, rollover: false },
      },
      subscribersCount: this.getAllUsers().filter((u) => u.subscription.status === 'active').length,
      createdAt: new Date().toISOString(),
    };

    this.draws.set(id, newDraw);

    DrawModel.create(newDraw).catch((err) => {
      console.error('[MongoDB Error] Failed to persist draw to Atlas:', err.message || err);
    });

    return newDraw;
  }

  publishDraw(drawId: string, winningNumbers: number[], logic: DrawLogic): { draw: IDraw; newWinners: IWinner[] } {
    let draw = this.draws.get(drawId);
    if (!draw) {
      draw = {
        id: drawId,
        month: 'Current Month 2026',
        status: 'scheduled',
        drawLogic: logic,
        scheduledDate: new Date().toISOString(),
        drawnDate: null,
        winningNumbers: [],
        totalPool: 25000,
        rolloverAmount: 0,
        tierAllocation: {
          match5: { share: 0.4, poolAmount: 10000, winnersCount: 0, perWinnerAmount: 0, rollover: true },
          match4: { share: 0.35, poolAmount: 8750, winnersCount: 0, perWinnerAmount: 0, rollover: false },
          match3: { share: 0.25, poolAmount: 6250, winnersCount: 0, perWinnerAmount: 0, rollover: false },
        },
        subscribersCount: this.getAllUsers().filter((u) => u.subscription.status === 'active').length,
        createdAt: new Date().toISOString(),
      };
    }

    const sim = this.simulateDraw(drawId, logic);
    const finalNumbers = winningNumbers && winningNumbers.length === 5 ? winningNumbers : sim.winningNumbers;

    draw.status = 'published';
    draw.drawLogic = logic;
    draw.drawnDate = new Date().toISOString();
    draw.winningNumbers = finalNumbers;
    draw.totalPool = sim.totalPool;
    draw.subscribersCount = sim.activeSubscribersCount;

    draw.tierAllocation = {
      match5: {
        share: 0.4,
        poolAmount: sim.tiers.match5.pool,
        winnersCount: sim.tiers.match5.winners.length,
        perWinnerAmount: sim.tiers.match5.perWinner,
        rollover: sim.tiers.match5.rollover,
      },
      match4: {
        share: 0.35,
        poolAmount: sim.tiers.match4.pool,
        winnersCount: sim.tiers.match4.winners.length,
        perWinnerAmount: sim.tiers.match4.perWinner,
        rollover: false,
      },
      match3: {
        share: 0.25,
        poolAmount: sim.tiers.match3.pool,
        winnersCount: sim.tiers.match3.winners.length,
        perWinnerAmount: sim.tiers.match3.perWinner,
        rollover: false,
      },
    };

    this.draws.set(draw.id, draw);

    // Save draw update in Atlas
    DrawModel.findOneAndUpdate({ id: draw.id }, draw, { upsert: true }).catch((err) => {
      console.error('[MongoDB Error] Failed to update draw in Atlas:', err.message || err);
    });

    const createdWinners: IWinner[] = [];

    const recordTierWinners = (winnersList: any[], matchType: '5-match' | '4-match' | '3-match', amount: number) => {
      for (const w of winnersList) {
        const winRecord: IWinner = {
          id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          drawId: draw!.id,
          drawMonth: draw!.month,
          userId: w.userId,
          userName: w.name,
          userEmail: w.email,
          matchType,
          matchedNumbers: w.matched,
          userScores: this.getUserScores(w.userId).map((s) => s.score),
          winningNumbers: finalNumbers,
          prizeAmount: amount,
          proofUrl: null,
          verificationStatus: 'pending',
          adminNotes: 'Awaiting winner scorecard screenshot submission.',
          payoutStatus: 'pending',
          payoutTransactionId: null,
          payoutDate: null,
          createdAt: new Date().toISOString(),
        };
        this.winners.set(winRecord.id, winRecord);
        createdWinners.push(winRecord);
      }
    };

    recordTierWinners(sim.tiers.match5.winners, '5-match', sim.tiers.match5.perWinner);
    recordTierWinners(sim.tiers.match4.winners, '4-match', sim.tiers.match4.perWinner);
    recordTierWinners(sim.tiers.match3.winners, '3-match', sim.tiers.match3.perWinner);

    if (createdWinners.length > 0) {
      WinnerModel.insertMany(createdWinners).catch((err) => {
        console.error('[MongoDB Error] Failed to insert winners in Atlas:', err.message || err);
      });
    }

    return { draw, newWinners: createdWinners };
  }

  // --- Winner Verification System (§09) ---
  getAllWinners(): IWinner[] {
    return Array.from(this.winners.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getUserWinners(userId: string): IWinner[] {
    return this.getAllWinners().filter((w) => w.userId === userId);
  }

  submitWinnerProof(
    winnerId: string,
    userId: string,
    proofUrl: string,
    notes?: string
  ): { error?: string; winner?: IWinner } {
    const w = this.winners.get(winnerId);
    if (!w) return { error: 'Winning claim record not found' };
    if (w.userId !== userId) return { error: 'Unauthorized to submit proof for this claim' };

    w.proofUrl = proofUrl;
    w.proofNotes = notes || '';
    w.verificationStatus = 'pending';
    w.adminNotes = 'Proof submitted by user. Awaiting admin scorecard review.';
    this.winners.set(winnerId, w);

    WinnerModel.findOneAndUpdate({ id: winnerId }, w).catch((err) => {
      console.error('[MongoDB Error] Failed to update winner proof in Atlas:', err.message || err);
    });

    return { winner: w };
  }

  verifyWinner(
    winnerId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): { error?: string; winner?: IWinner } {
    const w = this.winners.get(winnerId);
    if (!w) return { error: 'Winning record not found' };

    w.verificationStatus = status;
    if (adminNotes) w.adminNotes = adminNotes;
    this.winners.set(winnerId, w);

    WinnerModel.findOneAndUpdate({ id: winnerId }, w).catch((err) => {
      console.error('[MongoDB Error] Failed to update winner verification in Atlas:', err.message || err);
    });

    return { winner: w };
  }

  markWinnerPayout(winnerId: string, transactionId?: string): { error?: string; winner?: IWinner } {
    const w = this.winners.get(winnerId);
    if (!w) return { error: 'Winning record not found' };
    if (w.verificationStatus !== 'approved') {
      return { error: 'Cannot pay out a prize that has not been approved.' };
    }

    w.payoutStatus = 'paid';
    w.payoutTransactionId =
      transactionId || `TX_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    w.payoutDate = new Date().toISOString();
    this.winners.set(winnerId, w);

    WinnerModel.findOneAndUpdate({ id: winnerId }, w).catch((err) => {
      console.error('[MongoDB Error] Failed to update winner payout in Atlas:', err.message || err);
    });

    return { winner: w };
  }

  // --- Analytics & Reports (§11.05) ---
  getReportsAndAnalytics() {
    const users = Array.from(this.users.values());
    const activeSubscribers = users.filter((u) => u.subscription.status === 'active');
    const totalSubscribers = activeSubscribers.length;

    const monthlyRevenue = activeSubscribers.reduce((acc, u) => {
      return acc + (u.subscription.plan === 'yearly' ? u.subscription.amount / 12 : u.subscription.amount);
    }, 0);

    const totalCharityDirect = Array.from(this.donations.values()).reduce((acc, d) => acc + d.amount, 0);
    const monthlyCharityFromSubs = activeSubscribers.reduce((acc, u) => {
      const fee = u.subscription.plan === 'yearly' ? u.subscription.amount / 12 : u.subscription.amount;
      const pct = (u.charitySelection?.percentage || 15) / 100;
      return acc + fee * pct;
    }, 0);

    const totalPrizePoolsHistory = Array.from(this.draws.values()).reduce((acc, d) => acc + d.totalPool, 0);
    const totalPrizesPaid = Array.from(this.winners.values())
      .filter((w) => w.payoutStatus === 'paid')
      .reduce((acc, w) => acc + w.prizeAmount, 0);

    const charityLeaderboard = Array.from(this.charities.values())
      .map((c) => ({
        id: c.id,
        name: c.name,
        totalRaised: c.totalRaised,
        supporters: c.supporterCount,
      }))
      .sort((a, b) => b.totalRaised - a.totalRaised);

    return {
      totalUsers: users.length,
      activeSubscribers: totalSubscribers,
      monthlyRevenue: Math.round(monthlyRevenue),
      totalPrizePoolCurrent: 28500,
      totalPrizePoolHistory: totalPrizePoolsHistory,
      totalPrizesPaid,
      totalCharityContributed: Math.round(totalCharityDirect + monthlyCharityFromSubs * 6 + 148500 + 94200 + 212000),
      monthlyCharityRate: Math.round(monthlyCharityFromSubs),
      drawStatistics: {
        totalDrawsHeld: Array.from(this.draws.values()).filter((d) => d.status === 'published').length,
        totalWinnersCount: this.winners.size,
        pendingVerifications: Array.from(this.winners.values()).filter((w) => w.verificationStatus === 'pending').length,
        currentJackpotRollover: 8000,
      },
      charityLeaderboard,
      databaseMetrics: {
        ...getDatabaseStatus(),
        atlasDocumentCounts: {
          users: this.users.size,
          charities: this.charities.size,
          scores: this.scores.size,
          draws: this.draws.size,
          winners: this.winners.size,
          donations: this.donations.size,
        },
      },
    };
  }

  async getLiveAtlasMetrics() {
    const isConn = isDbConnected();
    let counts = { users: 0, charities: 0, scores: 0, draws: 0, winners: 0, donations: 0 };
    if (isConn) {
      try {
        const [u, c, s, d, w, don] = await Promise.all([
          UserModel.countDocuments(),
          CharityModel.countDocuments(),
          ScoreModel.countDocuments(),
          DrawModel.countDocuments(),
          WinnerModel.countDocuments(),
          DonationModel.countDocuments(),
        ]);
        counts = { users: u, charities: c, scores: s, draws: d, winners: w, donations: don };
      } catch (e: any) {
        console.error('[Store] Error getting live counts from Atlas:', e.message);
      }
    }
    return {
      connected: isConn,
      status: getDatabaseStatus(),
      counts,
    };
  }
}

export const store = new MongoStore();
