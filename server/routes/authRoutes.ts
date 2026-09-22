import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../store.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, plan, charityId, charityPercentage, handicap, homeClub, paymentMethod } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = store.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const chosenPlan = plan === 'yearly' ? 'yearly' : 'monthly';
    const chosenPercentage = Math.max(10, Number(charityPercentage) || 15);
    const charity = store.getCharityById(charityId || 'charity-1');

    const defaultPayment = paymentMethod || {
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expMonth: '12',
      expYear: '2028',
      cardholderName: name,
      isDefault: true
    };

    const newUser = store.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'subscriber',
      handicap: handicap !== undefined ? Number(handicap) : 15.4,
      homeClub: homeClub || 'Torrey Pines South',
      subscription: {
        status: 'active',
        plan: chosenPlan,
        amount: chosenPlan === 'yearly' ? 290 : 29,
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + (chosenPlan === 'yearly' ? 365 : 30) * 86400000).toISOString()
      },
      charitySelection: {
        charityId: charity?.id || 'charity-1',
        charityName: charity?.name || 'Fore Hope Veterans Foundation',
        percentage: chosenPercentage
      },
      paymentMethod: defaultPayment,
      paymentMethods: [defaultPayment]
    });

    const token = store.signToken(newUser);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered and subscription activated.',
      token,
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = store.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = store.signToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
});

// POST /api/auth/demo-login (1-click preset login for reviewers)
router.post('/demo-login', (req, res) => {
  try {
    const { role } = req.body; // 'subscriber' | 'admin'
    const email = role === 'admin' ? 'admin@digitalheroes.com' : 'subscriber@digitalheroes.com';
    const user = store.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo user not found' });
    }

    const token = store.signToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: `Logged in as ${user.name} (${user.role}).`,
      token,
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { password: _, ...safeUser } = req.user!;
  res.json({ success: true, user: safeUser });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, handicap, homeClub, avatarUrl } = req.body;
    const updated = store.updateUser(req.user!.id, {
      name,
      handicap: handicap !== undefined ? Number(handicap) : undefined,
      homeClub,
      avatarUrl
    });

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    const { password: _, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// POST /api/auth/charity
router.post('/charity', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { charityId, percentage } = req.body;
    const charity = store.getCharityById(charityId);
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found' });
    }

    const pct = Math.max(10, Number(percentage) || 10); // Enforce minimum 10%

    const updated = store.updateUser(req.user!.id, {
      charitySelection: {
        charityId: charity.id,
        charityName: charity.name,
        percentage: pct
      }
    });

    const { password: _, ...safeUser } = updated!;
    res.json({
      success: true,
      message: `Charity selection updated to ${charity.name} with ${pct}% contribution.`,
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// POST /api/auth/subscription/checkout (handles monthly/yearly activation & PCI compliance simulation)
router.post('/subscription/checkout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { plan, paymentMethod } = req.body; // 'monthly' | 'yearly'
    const chosenPlan = plan === 'yearly' ? 'yearly' : 'monthly';
    const amount = chosenPlan === 'yearly' ? 290 : 29;
    const renewalDate = new Date(Date.now() + (chosenPlan === 'yearly' ? 365 : 30) * 86400000).toISOString();

    const updates: any = {
      subscription: {
        status: 'active',
        plan: chosenPlan,
        amount,
        startDate: new Date().toISOString(),
        renewalDate,
        stripeCustomerId: `cus_sim_${Date.now()}`
      }
    };

    if (paymentMethod) {
      updates.paymentMethod = paymentMethod;
      const currentList = req.user!.paymentMethods || [];
      // avoid exact dupes
      const exists = currentList.some(p => p.type === paymentMethod.type && p.last4 === paymentMethod.last4);
      if (!exists) {
        updates.paymentMethods = [...currentList, paymentMethod];
      }
    }

    const updated = store.updateUser(req.user!.id, updates);

    const { password: _, ...safeUser } = updated!;
    res.json({
      success: true,
      message: `Subscription successfully set to ${chosenPlan} plan.`,
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// POST /api/auth/payment-method (add or update payment method)
router.post('/payment-method', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentMethod } = req.body;
    if (!paymentMethod || !paymentMethod.type) {
      return res.status(400).json({ success: false, message: 'Valid payment method data is required.' });
    }

    const currentList = req.user!.paymentMethods || [];
    const updatedList = [paymentMethod, ...currentList.filter(p => !(p.type === paymentMethod.type && p.last4 === paymentMethod.last4))];

    const updated = store.updateUser(req.user!.id, {
      paymentMethod: { ...paymentMethod, isDefault: true },
      paymentMethods: updatedList
    });

    const { password: _, ...safeUser } = updated!;
    res.json({
      success: true,
      message: 'Payment method updated successfully.',
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// POST /api/auth/subscription/toggle
router.post('/subscription/toggle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentStatus = req.user!.subscription.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    const updated = store.updateUser(req.user!.id, {
      subscription: {
        ...req.user!.subscription,
        status: newStatus
      }
    });

    const { password: _, ...safeUser } = updated!;
    res.json({
      success: true,
      message: `Subscription status is now ${newStatus}.`,
      user: safeUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

export default router;
