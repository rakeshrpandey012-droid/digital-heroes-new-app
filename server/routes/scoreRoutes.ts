import { Router, Response } from 'express';
import { store } from '../store.ts';
import { requireAuth, requireActiveSubscription, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/scores (Get user's latest 5 scores in reverse chronological order)
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const scores = store.getUserScores(req.user!.id);
    res.json({
      success: true,
      count: scores.length,
      maxAllowed: 5,
      scores
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching scores' });
  }
});

// POST /api/scores (Add a score with 1-45 range, date uniqueness check, and 5-score FIFO rolling replacement)
router.post('/', requireAuth, requireActiveSubscription, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { score, date, courseName, holesPlayed, notes } = req.body;

    if (score === undefined || !date || !courseName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Score (1-45), Date (YYYY-MM-DD), and Course Name are required.' 
      });
    }

    const result = store.addScore(req.user!.id, {
      score: Number(score),
      date,
      courseName,
      holesPlayed: holesPlayed ? Number(holesPlayed) as 9 | 18 : 18,
      notes
    });

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // Return the updated 5 scores
    const updatedScores = store.getUserScores(req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Score recorded successfully. Your latest 5 scores form your draw ticket numbers.',
      score: result.score,
      allScores: updatedScores
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error saving score' });
  }
});

// PUT /api/scores/:id (Edit an existing score)
router.put('/:id', requireAuth, requireActiveSubscription, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { score, date, courseName, holesPlayed, notes } = req.body;

    const result = store.updateScore(id, req.user!.id, {
      score: score !== undefined ? Number(score) : undefined,
      date,
      courseName,
      holesPlayed: holesPlayed ? Number(holesPlayed) as 9 | 18 : undefined,
      notes
    });

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    const updatedScores = store.getUserScores(req.user!.id);

    res.json({
      success: true,
      message: 'Score updated successfully.',
      score: result.score,
      allScores: updatedScores
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating score' });
  }
});

// DELETE /api/scores/:id
router.delete('/:id', requireAuth, requireActiveSubscription, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = store.deleteScore(id, req.user!.id);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Score not found or unauthorized.' });
    }

    const updatedScores = store.getUserScores(req.user!.id);

    res.json({
      success: true,
      message: 'Score deleted.',
      allScores: updatedScores
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting score' });
  }
});

export default router;
