import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Eye, 
  EyeOff, 
  Heart, 
  Award, 
  ArrowLeft,
  ArrowRight,
  Target,
  CreditCard,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Charity, PaymentMethodInfo } from '../types.ts';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector.tsx';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  setCurrentTab: (tab: string) => void;
  openDonateModal?: (charity: Charity) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  setCurrentTab
}) => {
  const { login, register, demoLogin, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [handicap, setHandicap] = useState<string>('12.4');
  const [homeClub, setHomeClub] = useState('Spyglass Dunes Links');
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('charity-1');
  const [charityPercentage, setCharityPercentage] = useState<number>(20);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInfo>({
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: '12',
    expYear: '2028',
    cardholderName: '',
    isDefault: true
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Fetch charities for partner selection
  useEffect(() => {
    fetch('/api/charities')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.charities) {
          setCharities(d.charities);
        }
      })
      .catch(() => {});
  }, []);

  // Update cardholder name if registration name changes
  useEffect(() => {
    if (regName && !paymentMethod.cardholderName) {
      setPaymentMethod(prev => ({ ...prev, cardholderName: regName }));
    }
  }, [regName]);

  // If already logged in, show indicator or button to go to dashboard
  useEffect(() => {
    if (user && !registeredSuccess) {
      // If user is already authenticated
    }
  }, [user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        // Redirect to dashboard or admin
        setCurrentTab('dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Try using one of the 1-Click Reviewer demo logins below.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        handicap: parseFloat(handicap) || 15.0,
        homeClub: homeClub || 'Public Links',
        plan,
        charityId: selectedCharityId,
        charityPercentage,
        paymentMethod
      });

      if (res.success) {
        setRegisteredSuccess(true);
        setTimeout(() => {
          setCurrentTab('dashboard');
        }, 2000);
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'subscriber' | 'admin') => {
    setLoading(true);
    await demoLogin(role);
    setLoading(false);
    if (role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const selectedCharity = charities.find(c => c.id === selectedCharityId) || charities[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home Overview</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>256-Bit SSL Encrypted Access</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/15 card-glow-amber relative overflow-hidden">
        
        {/* Subtle background micro-glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tab Mode Switcher (Sign In vs Register) */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-1 max-w-sm w-full">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 1: LOGIN                                         */}
        {/* ---------------------------------------------------- */}
        {mode === 'login' && (
          <div className="max-w-md mx-auto space-y-6">
            
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400">
                Enter your credentials to access your verified 5-score ticket, draw allocations, and cause directorship.
              </p>
            </div>

            {/* Quick Demo Logins Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Fast Reviewer 1-Click Access
                </span>
                <span className="text-[10px] text-slate-400">Instant Tokenization</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemo('subscriber')}
                  disabled={loading}
                  className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">Marcus Vance</div>
                  <div className="text-[10px] text-amber-400 font-semibold">Active Subscriber</div>
                  <div className="text-[10px] text-slate-400 mt-1">5 scores · $1,250 pending win</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemo('admin')}
                  disabled={loading}
                  className="p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">Elena Vance-Hayes</div>
                  <div className="text-[10px] text-indigo-400 font-semibold">Platform Lead / Admin</div>
                  <div className="text-[10px] text-slate-400 mt-1">5 control surfaces · Draw engine</div>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full"></div>
              <span className="bg-[#0B0F17] px-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono shrink-0">
                Or Sign In With Password
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="subscriber@digitalheroes.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('subscriber@digitalheroes.com');
                      setLoginPassword('Password123!');
                    }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Fill Demo Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-slate-500">Secured with SHA-256</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Platform</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">New to Digital Heroes? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-amber-400 font-semibold hover:underline"
              >
                Create an account & join the draw →
              </button>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 2: NEW USER CREATION & REGISTRATION             */}
        {/* ---------------------------------------------------- */}
        {mode === 'register' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Join The Digital Heroes Network</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create Your Subscriber Account
              </h2>
              <p className="text-xs text-slate-400">
                Turn your Stableford golf rounds into monthly jackpot entries while directing vital funds to verified veteran, pediatric cancer, and adaptive athletic causes.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2 rounded-xl border transition-all ${
                regStep === 1 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold' 
                  : regStep > 1 
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                  : 'border-white/5 bg-slate-900 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase font-mono">Step 1</div>
                <div className="truncate font-medium">Golfer Info</div>
              </div>

              <div className={`p-2 rounded-xl border transition-all ${
                regStep === 2 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold' 
                  : regStep > 2 
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                  : 'border-white/5 bg-slate-900 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase font-mono">Step 2</div>
                <div className="truncate font-medium">Plan Tier</div>
              </div>

              <div className={`p-2 rounded-xl border transition-all ${
                regStep === 3 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold' 
                  : regStep > 3 
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                  : 'border-white/5 bg-slate-900 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase font-mono">Step 3</div>
                <div className="truncate font-medium">Your Cause</div>
              </div>

              <div className={`p-2 rounded-xl border transition-all ${
                regStep === 4 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold' 
                  : 'border-white/5 bg-slate-900 text-slate-500'
              }`}>
                <div className="text-[10px] uppercase font-mono">Step 4</div>
                <div className="truncate font-medium">Payment</div>
              </div>
            </div>

            {/* Registration Wizard Steps Form */}
            <form onSubmit={handleRegisterSubmit} className="max-w-2xl mx-auto space-y-6">
              
              {/* STEP 1: GOLFER & ACCOUNT DETAILS */}
              {regStep === 1 && (
                <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-amber-400" />
                      Golfer Credentials & Profile
                    </h3>
                    <span className="text-[11px] text-slate-400">Step 1 of 4</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="marcus@golflink.com"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Account Password
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Official Handicap Index (GHIN / WHS)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="54"
                        required
                        value={handicap}
                        onChange={e => setHandicap(e.target.value)}
                        placeholder="14.2"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Home Golf Club or Preferred Course
                      </label>
                      <input
                        type="text"
                        value={homeClub}
                        onChange={e => setHomeClub(e.target.value)}
                        placeholder="e.g. Spyglass Dunes Links or Municipal Club"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!regName || !regEmail || !regPassword) {
                          setError('Please fill in name, email, and password to proceed.');
                          return;
                        }
                        setError(null);
                        setRegStep(2);
                      }}
                      className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Continue to Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SUBSCRIPTION PLAN */}
              {regStep === 2 && (
                <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Select Membership Plan (PRD §04)
                    </h3>
                    <span className="text-[11px] text-slate-400">Step 2 of 4</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Monthly Plan */}
                    <div
                      onClick={() => setPlan('monthly')}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        plan === 'monthly'
                          ? 'border-amber-500 bg-amber-500/15 card-glow-amber'
                          : 'border-white/10 bg-slate-950 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Monthly Tier</span>
                          {plan === 'monthly' && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="mt-2">
                          <span className="text-3xl font-extrabold text-white font-mono">$29</span>
                          <span className="text-xs text-slate-400"> / month</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Billed monthly. Cancel anytime with no commitments. Full eligibility in monthly draws.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] space-y-1.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>5-Score Rolling FIFO Ticket</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Direct min 10% to Charity</span>
                        </div>
                      </div>
                    </div>

                    {/* Yearly Plan */}
                    <div
                      onClick={() => setPlan('yearly')}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                        plan === 'yearly'
                          ? 'border-amber-500 bg-amber-500/15 card-glow-amber'
                          : 'border-white/10 bg-slate-950 hover:border-white/20'
                      }`}
                    >
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold uppercase">
                        2 Months Free
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Yearly Tier</span>
                          {plan === 'yearly' && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="mt-2">
                          <span className="text-3xl font-extrabold text-white font-mono">$290</span>
                          <span className="text-xs text-slate-400"> / year</span>
                        </div>
                        <p className="text-[11px] text-emerald-400/90 font-medium mt-2">
                          Save $58 annually. Unlocks priority draw participation and guaranteed sponsor rewards.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] space-y-1.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All Monthly Tier Privileges</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>VIP Invitational Access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                    >
                      ← Back to Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegStep(3)}
                      className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Continue to Cause</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CHARITY PARTNER & ALLOCATION */}
              {regStep === 3 && (
                <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Designate Your Charity Partner (PRD §08)
                    </h3>
                    <span className="text-[11px] text-slate-400">Step 3 of 4</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    A minimum of <span className="text-amber-400 font-bold">10%</span> (and up to 100%) of every membership fee is guaranteed to your selected non-profit foundation.
                  </p>

                  {/* Charity Selection Grid */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {charities.map(charity => {
                      const isSelected = selectedCharityId === charity.id;
                      return (
                        <div
                          key={charity.id}
                          onClick={() => setSelectedCharityId(charity.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/15 card-glow-amber'
                              : 'border-white/10 bg-slate-950 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={charity.logoUrl}
                              alt=""
                              onError={e => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=200&q=80';
                              }}
                              className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{charity.name}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-sm">{charity.tagline}</div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-3">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-white/20"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contribution Slider */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Monthly Fee Allocation to Cause:</span>
                      <span className="text-sm font-extrabold text-amber-400 font-mono">{charityPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={charityPercentage}
                      onChange={e => setCharityPercentage(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>10% (PRD Minimum)</span>
                      <span>50%</span>
                      <span>100% (All-Giving)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-lg">
                      Every month, <span className="font-bold text-white">${((plan === 'yearly' ? 24.16 : 29) * (charityPercentage / 100)).toFixed(2)}</span> will be transferred directly to <span className="font-semibold text-amber-400">{selectedCharity?.name}</span>.
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                    >
                      ← Back to Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegStep(4)}
                      className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT METHOD & FINAL CONFIRMATION */}
              {regStep === 4 && (
                <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      Add Payment Method & Activate
                    </h3>
                    <span className="text-[11px] text-slate-400">Step 4 of 4</span>
                  </div>

                  {/* Summary recap box */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">
                        {plan === 'yearly' ? 'Yearly Membership ($290/yr)' : 'Monthly Membership ($29/mo)'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Directing {charityPercentage}% to {selectedCharity?.name}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {plan === 'yearly' ? '$290.00' : '$29.00'}
                    </span>
                  </div>

                  {/* Reusable Rich Payment Method Selector */}
                  <PaymentMethodSelector
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    compact={false}
                  />

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(3)}
                      className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                    >
                      ← Back to Cause
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="py-3 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Complete & Activate Subscription</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>

            {registeredSuccess && (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-white">Welcome to Digital Heroes!</h3>
                <p className="text-xs text-emerald-300">
                  Your subscription and payment method have been saved. Directing you to your personal performance & draw dashboard...
                </p>
              </div>
            )}

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-amber-400 font-semibold hover:underline"
              >
                Sign In instead →
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
