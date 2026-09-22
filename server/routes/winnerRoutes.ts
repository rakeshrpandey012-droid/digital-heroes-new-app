import { Router, Response } from 'express';
import { store } from '../store.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/winners/my-winnings (Get authenticated user's winnings and claims)
router.get('/my-winnings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const winnings = store.getUserWinners(req.user!.id);
    const totalWon = winnings.reduce((acc, w) => acc + w.prizeAmount, 0);
    const totalPaid = winnings.filter(w => w.payoutStatus === 'paid').reduce((acc, w) => acc + w.prizeAmount, 0);
    const pendingVerification = winnings.filter(w => w.verificationStatus === 'pending').length;

    res.json({
      success: true,
      totalWon,
      totalPaid,
      pendingVerification,
      winnings
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching winnings' });
  }
});

// POST /api/winners/:id/proof (Upload screenshot / proof from golf platform)
router.post('/:id/proof', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { proofUrl, notes } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a screenshot proof image or verification URL from your golf platform (e.g. GHIN, Golf Genius).' 
      });
    }

    const result = store.submitWinnerProof(id, req.user!.id, proofUrl, notes);
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: 'Proof uploaded successfully. Your submission is now queued for administrator review.',
      winner: result.winner
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting proof' });
  }
});

export default router;
