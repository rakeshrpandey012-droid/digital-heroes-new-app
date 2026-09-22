import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [charityPercentage, setCharityPercentage] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Login failed');
        }
      } else {
        const res = await register({
          name,
          email,
          password,
          plan,
          charityPercentage
        });
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Registration failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'subscriber' | 'admin') => {
    setLoading(true);
    await demoLogin(role);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 border border-white/15 card-glow-amber">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome to Digital Heroes' : 'Create Your Subscriber Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? 'Enter credentials to access your scores, draws, and charity impact' 
              : 'Join the premier golf performance & charity reward engine'}
          </p>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="mb-6 p-3 bg-slate-900/90 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast Reviewer Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('subscriber')}
              className="py-2 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium text-left transition-all"
            >
              <div className="font-semibold text-[11px]">Subscriber (Marcus)</div>
              <div className="text-[10px] text-slate-400">5 scores · 1 pending win</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="py-2 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium text-left transition-all"
            >
              <div className="font-semibold text-[11px]">Admin (Elena)</div>
              <div className="text-[10px] text-slate-400">Full 5 control surfaces</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Subscription Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlan('monthly')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      plan === 'monthly'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-white/10 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">$29 / month</div>
                    <div className="text-[10px] text-slate-400">Standard monthly</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan('yearly')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      plan === 'yearly'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-white/10 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      $290 / year
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">2 Mo Free</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Discounted annual</div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Charity Share ({charityPercentage}%)</span>
                  <span className="text-amber-400 font-semibold">Min 10% enforced</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={charityPercentage}
                  onChange={e => setCharityPercentage(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Platform' : 'Complete Registration & Activate'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-amber-400 hover:underline font-semibold"
              >
                Sign Up & Subscribe
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-amber-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
