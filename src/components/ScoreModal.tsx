import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, AlertCircle, Info, Check } from 'lucide-react';
import { Score } from '../types.ts';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingScore?: Score | null;
  onScoreSaved: () => void;
  token: string | null;
  existingScores: Score[];
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  editingScore,
  onScoreSaved,
  token,
  existingScores
}) => {
  const [score, setScore] = useState<number | string>(36);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseName, setCourseName] = useState('Pebble Ridge Coastal Links');
  const [holesPlayed, setHolesPlayed] = useState<9 | 18>(18);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingScore) {
      setScore(editingScore.score);
      setDate(editingScore.date);
      setCourseName(editingScore.courseName);
      setHolesPlayed(editingScore.holesPlayed);
      setNotes(editingScore.notes || '');
    } else {
      setScore(36);
      setDate(new Date().toISOString().split('T')[0]);
      setCourseName('Spyglass Dunes Links');
      setHolesPlayed(18);
      setNotes('');
    }
    setError(null);
  }, [editingScore, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Stableford score must be between 1 and 45.');
      return;
    }

    if (!date) {
      setError('Please select a valid date for the round.');
      return;
    }

    // Check duplicate date client-side as well
    const duplicate = existingScores.find(s => s.date === date && (!editingScore || s.id !== editingScore.id));
    if (duplicate) {
      setError(`Only one score entry is permitted per date. A score for ${date} (${duplicate.score} pts at ${duplicate.courseName}) already exists.`);
      return;
    }

    setLoading(true);
    try {
      const url = editingScore ? `/api/scores/${editingScore.id}` : '/api/scores';
      const method = editingScore ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          score: scoreNum,
          date,
          courseName,
          holesPlayed,
          notes
        })
      });

      const data = await res.json();
      if (data.success) {
        onScoreSaved();
        onClose();
      } else {
        setError(data.message || 'Error recording score.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-white/15 card-glow-amber">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              {editingScore ? 'Edit Scorecard Entry' : 'Record Stableford Score'}
            </h3>
            <p className="text-[11px] text-slate-400">
              PRD §05: Range 1–45 · 5-score FIFO rolling window
            </p>
          </div>
        </div>

        {/* Information note about FIFO replacement */}
        {!editingScore && existingScores.length >= 5 && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold">Rolling 5-score limit reached:</span> Adding this new score will automatically drop your oldest stored score to maintain your exact 5 active draw numbers.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Stableford Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Stableford Points (1 – 45)
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Draw Number: {score}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="45"
              required
              value={score}
              onChange={e => setScore(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-base font-bold text-white focus:outline-none focus:border-amber-500 text-center font-mono"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
              <span>Min: 1 point</span>
              <span>Par golf ~ 36 pts</span>
              <span>Max: 45 points</span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Round Date (Only 1 entry per date permitted)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Course Name</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Torrey Pines Championship"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Holes Played */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Holes Played</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHolesPlayed(18)}
                className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                  holesPlayed === 18 
                    ? 'border-amber-500 bg-amber-500/10 text-white font-semibold' 
                    : 'border-white/10 bg-slate-900 text-slate-400'
                }`}
              >
                18 Holes (Full Round)
              </button>
              <button
                type="button"
                onClick={() => setHolesPlayed(9)}
                className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                  holesPlayed === 9 
                    ? 'border-amber-500 bg-amber-500/10 text-white font-semibold' 
                    : 'border-white/10 bg-slate-900 text-slate-400'
                }`}
              >
                9 Holes (Scaled)
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Round Notes / Highlights</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Strong irons in windy conditions, 4 birdies."
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Saving...' : editingScore ? 'Update Score' : 'Record Score into Draw Pool'}
          </button>
        </form>

      </div>
    </div>
  );
};
