import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, ShieldAlert, Award, FileText, Image as ImageIcon } from 'lucide-react';
import { Winner } from '../types.ts';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner | null;
  token: string | null;
  onUploadSuccess: () => void;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  isOpen,
  onClose,
  winner,
  token,
  onUploadSuccess
}) => {
  const [proofUrl, setProofUrl] = useState(
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !winner) return null;

  const sampleProofs = [
    { label: 'Official GHIN Handicap Scorecard', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
    { label: 'Golf Genius Certified Tournament Record', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Club Championship Scramble Card', url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/winners/${winner.id}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          proofUrl,
          notes: notes || 'Verified scorecard from club golf system'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onUploadSuccess();
      } else {
        setError(data.message || 'Error submitting proof');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 border border-white/15 card-glow-amber">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Scorecard Submitted for Review</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your winning claim for <span className="text-amber-400 font-bold">${winner.prizeAmount.toLocaleString()}</span> is now queued with our administrator audit desk. Once approved, payout will be marked to your subscription account.
            </p>
            <button
              onClick={() => { setSuccess(false); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Winner Verification Submission
                </h3>
                <p className="text-[11px] text-slate-400">
                  PRD §09: Screenshot of scores from golf platform (GHIN / WHS)
                </p>
              </div>
            </div>

            {/* Claim Details Card */}
            <div className="p-4 bg-slate-900/90 rounded-xl border border-amber-500/20 mb-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Draw Event</span>
                <span className="text-white font-semibold">{winner.drawMonth}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Match Category</span>
                <span className="text-amber-400 font-bold uppercase">{winner.matchType}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Prize Pool Allocation</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  ${winner.prizeAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                <span className="text-slate-400">Matched Numbers</span>
                <div className="flex gap-1">
                  {winner.matchedNumbers.map(n => (
                    <span key={n} className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold text-[11px] flex items-center justify-center font-mono">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Scorecard Proof Document or Paste Image URL
                </label>
                <div className="space-y-1.5 mb-2">
                  {sampleProofs.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProofUrl(p.url)}
                      className={`w-full p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                        proofUrl === p.url 
                          ? 'border-amber-500 bg-amber-500/10 text-white font-medium' 
                          : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        {p.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Select</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    required
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                    placeholder="https://your-scorecard-screenshot-url.jpg"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Preview */}
              {proofUrl && (
                <div className="p-2 bg-slate-900 rounded-xl border border-white/10">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Proof Preview
                  </p>
                  <img
                    src={proofUrl}
                    alt="Proof"
                    className="w-full h-32 object-cover rounded-lg border border-white/5"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Handicap ID / Club Scoring Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. GHIN #9842109, rounds logged via Golf Genius at Spyglass"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Upload Official Proof for Verification'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
