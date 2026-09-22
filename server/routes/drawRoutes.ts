import { Router, Request, Response } from 'express';
import { store } from '../store.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/draws/current (Get current scheduled/active draw info and prize pool breakdown)
router.get('/current', (_req: Request, res: Response) => {
  try {
    const draws = Array.from(store.draws.values());
    const current = draws.find(d => d.status === 'scheduled') || draws[draws.length - 1];

    res.json({
      success: true,
      draw: current,
      rules: {
        match5Share: '40% of pool + Rollover Jackpot',
        match4Share: '35% of pool (split equally)',
        match3Share: '25% of pool (split equally)',
        eligibleNumbersRange: '1 to 45 (Stableford format)',
        rolloverAppliesTo: '5-number match only'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching current draw' });
  }
});

// GET /api/draws/history (Past published draws)
router.get('/history', (_req: Request, res: Response) => {
  try {
    const publishedDraws = Array.from(store.draws.values())
      .filter(d => d.status === 'published')
      .sort((a, b) => new Date(b.drawnDate || b.scheduledDate).getTime() - new Date(a.drawnDate || a.scheduledDate).getTime());

    res.json({
      success: true,
      count: publishedDraws.length,
      draws: publishedDraws
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching draw history' });
  }
});

// GET /api/draws/check-ticket (Checks user's 5 scores against current or latest draw)
router.get('/check-ticket', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userScores = store.getUserScores(req.user!.id);
    const scoreNumbers = userScores.map(s => s.score);

    const draws = Array.from(store.draws.values());
    const latestPublished = draws
      .filter(d => d.status === 'published')
      .sort((a, b) => new Date(b.drawnDate || '').getTime() - new Date(a.drawnDate || '').getTime())[0];

    let matchCount = 0;
    let matchedNumbers: number[] = [];

    if (latestPublished && latestPublished.winningNumbers.length > 0) {
      matchedNumbers = scoreNumbers.filter(num => latestPublished.winningNumbers.includes(num));
      matchCount = matchedNumbers.length;
    }

    res.json({
      success: true,
      ticketNumbers: scoreNumbers,
      scoresComplete: scoreNumbers.length === 5,
      latestDraw: latestPublished ? {
        id: latestPublished.id,
        month: latestPublished.month,
        drawnDate: latestPublished.drawnDate,
        winningNumbers: latestPublished.winningNumbers,
        matchedNumbers,
        matchCount,
        isWinner: matchCount >= 3,
        tier: matchCount === 5 ? '5-match Jackpot' : matchCount === 4 ? '4-match' : matchCount === 3 ? '3-match' : 'None'
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error checking ticket' });
  }
});

// GET /api/draws/winners (Public showcase of recent winners)
router.get('/winners', (_req: Request, res: Response) => {
  try {
    const winners = store.getAllWinners();
    // Sanitize user emails for public view
    const publicWinners = winners.map(w => ({
      id: w.id,
      drawMonth: w.drawMonth,
      userName: w.userName.split(' ')[0] + ' ' + (w.userName.split(' ')[1]?.[0] || '') + '.',
      matchType: w.matchType,
      prizeAmount: w.prizeAmount,
      verificationStatus: w.verificationStatus,
      payoutStatus: w.payoutStatus,
      payoutDate: w.payoutDate,
      createdAt: w.createdAt
    }));

    res.json({
      success: true,
      count: publicWinners.length,
      winners: publicWinners
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching winners' });
  }
});

export default router;
