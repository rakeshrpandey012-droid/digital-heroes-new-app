import { Router, Request, Response } from 'express';
import { store } from '../store.ts';

const router = Router();

// GET /api/charities (List with search & filter)
router.get('/', (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    let charities = store.getAllCharities();

    if (category && category !== 'All') {
      charities = charities.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).toLowerCase();
      charities = charities.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.tagline.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: charities.length,
      charities
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching charities' });
  }
});

// GET /api/charities/spotlight (Featured charities for homepage)
router.get('/spotlight', (_req: Request, res: Response) => {
  try {
    const charities = store.getAllCharities();
    const featured = charities.filter(c => c.featured);
    const spotlight = featured.length > 0 ? featured : charities.slice(0, 2);

    res.json({
      success: true,
      spotlight
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching spotlight' });
  }
});

// GET /api/charities/:id (Detailed profile + events)
router.get('/:id', (req: Request, res: Response) => {
  try {
    const charity = store.getCharityById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found' });
    }

    res.json({
      success: true,
      charity
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching charity' });
  }
});

// POST /api/charities/:id/donate (Independent direct donation not tied to gameplay)
router.post('/:id/donate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, donorName, donorEmail, message, isAnonymous } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid donation amount.' });
    }

    if (!donorName || !donorEmail) {
      return res.status(400).json({ success: false, message: 'Donor name and email are required for receipt.' });
    }

    const donation = store.addDonation({
      charityId: id,
      amount: Number(amount),
      donorName,
      donorEmail,
      message,
      isAnonymous: Boolean(isAnonymous)
    });

    const updatedCharity = store.getCharityById(id);

    res.status(201).json({
      success: true,
      message: `Thank you, ${donorName}! Your $${amount} donation has been processed.`,
      donation,
      charityTotalRaised: updatedCharity?.totalRaised
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error processing donation' });
  }
});

export default router;
