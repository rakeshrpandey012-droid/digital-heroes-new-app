import React, { useState } from 'react';
import { X, Heart, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Charity } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  charity: Charity | null;
  onDonationSuccess: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  charity,
  onDonationSuccess
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !charity) return null;

  const presetAmounts = [25, 50, 100, 250];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      setError('Please specify a donation amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/charities/${charity.id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          donorName: isAnonymous ? 'Anonymous Donor' : (donorName || 'Generous Supporter'),
          donorEmail: donorEmail || 'donor@example.com',
          message,
          isAnonymous,
          userId: user?.id
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onDonationSuccess();
      } else {
        setError(data.message || 'Donation could not be processed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 border border-white/15 card-glow-amber">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Thank You For Your Impact!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your direct contribution of <span className="font-bold text-emerald-400">${customAmount || amount}</span> has been transferred to <span className="text-white font-semibold">{charity.name}</span>.
            </p>
            <div className="pt-4">
              <button
                onClick={() => { setSuccess(false); onClose(); }}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Direct Charity Gift
                </h3>
                <p className="text-[11px] text-slate-400">
                  PRD §08.1: Independent giving, 100% directed to cause
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 mb-4 flex items-center gap-3">
              <img 
                src={charity.logoUrl} 
                alt={charity.name} 
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=400&q=80';
                }}
                className="w-10 h-10 rounded-lg object-cover border border-white/10"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{charity.name}</p>
                <p className="text-[10px] text-amber-400 truncate">{charity.category}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleDonate} className="space-y-4">
              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Gift Tier</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {presetAmounts.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setAmount(p); setCustomAmount(''); }}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        amount === p && !customAmount
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-sm'
                          : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Or enter custom amount ($)"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); }}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Donor info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Email for Receipt</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={e => setDonorEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Donor Note */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Message of Encouragement (Optional)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Keep up the inspiring work on the fairways!"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 accent-amber-500 w-4 h-4"
                />
                <span>List donation as Anonymous on charity ledger</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 text-white font-semibold text-xs transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                {loading ? 'Processing Gift...' : `Confirm $${customAmount || amount} Direct Donation`}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulated PCI-Compliant checkout · Tax receipt issued</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
