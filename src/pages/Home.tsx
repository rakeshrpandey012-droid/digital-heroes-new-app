import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Heart, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Flame,
  CheckCircle2,
  Lock,
  ExternalLink,
  Percent
} from 'lucide-react';
import { Draw, Charity, Winner } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
  openSubscribeModal: () => void;
  openDonateModal: (charity: Charity) => void;
  openAuthModal: () => void;
}

export const Home: React.FC<HomeProps> = ({
  setCurrentTab,
  openSubscribeModal,
  openDonateModal,
  openAuthModal
}) => {
  const { user } = useAuth();
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [spotlightCharities, setSpotlightCharities] = useState<Charity[]>([]);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 9, hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    // Fetch Current Draw
    fetch('/api/draws/current')
      .then(r => r.json())
      .then(d => { if (d.success) setCurrentDraw(d.draw); })
      .catch(() => {});

    // Fetch Spotlight Charities
    fetch('/api/charities/spotlight')
      .then(r => r.json())
      .then(d => { if (d.success) setSpotlightCharities(d.spotlight); })
      .catch(() => {});

    // Fetch Recent Winners
    fetch('/api/draws/winners')
      .then(r => r.json())
      .then(d => { if (d.success) setRecentWinners(d.winners); })
      .catch(() => {});

    // Live countdown timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 hero-gradient pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Subtle Top Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-semibold text-amber-400 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Digital Heroes 2026 Edition · Purpose-Driven Athletic Giving</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                Play With Purpose. <br />
                <span className="gold-gradient-text">Win For Good.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                A modern, emotion-driven subscription engine. Track your Stableford golf scores, join monthly prize pool draws, and automatically power transformative charities with every swing.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {user ? (
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-black font-bold text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Open Your Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={openSubscribeModal}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-black font-bold text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Subscribe & Enter Draw
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setCurrentTab('charities')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  Explore Causes
                </button>
              </div>

              {/* Metrics Strip */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-2xl font-bold font-display text-white">$604K+</div>
                  <div className="text-xs text-slate-400">Total Charity Impact</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-amber-400">$28,500</div>
                  <div className="text-xs text-slate-400">Current Prize Pool</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-emerald-400">10% Min</div>
                  <div className="text-xs text-slate-400">Guaranteed Giving</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Draw Countdown & Pool Showcase Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-amber-500/30 card-glow-amber relative">
                
                {/* Header of card */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {currentDraw?.month || 'March 2026'} Draw
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {currentDraw?.drawLogic === 'algorithmic' ? 'Weighted Algorithmic' : 'Random Lottery'}
                  </span>
                </div>

                {/* Total Pool Metric */}
                <div className="py-5 text-center">
                  <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">Total Prize Pool</span>
                  <div className="text-4xl sm:text-5xl font-extrabold font-display text-white mt-1">
                    ${(currentDraw?.totalPool || 28500).toLocaleString()}
                  </div>
                  {currentDraw?.rolloverAmount ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Includes ${currentDraw.rolloverAmount.toLocaleString()} Rollover Jackpot!</span>
                    </div>
                  ) : null}
                </div>

                {/* Live Countdown Grid */}
                <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10">
                  <p className="text-[11px] uppercase font-semibold text-slate-400 text-center mb-2.5">
                    Draw Closes In
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                      <div className="text-xl font-bold text-white">{timeLeft.days}</div>
                      <div className="text-[9px] uppercase text-slate-400">Days</div>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                      <div className="text-xl font-bold text-white">{timeLeft.hours}</div>
                      <div className="text-[9px] uppercase text-slate-400">Hours</div>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                      <div className="text-xl font-bold text-white">{timeLeft.minutes}</div>
                      <div className="text-[9px] uppercase text-slate-400">Mins</div>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                      <div className="text-xl font-bold text-amber-400">{timeLeft.seconds}</div>
                      <div className="text-[9px] uppercase text-slate-400">Secs</div>
                    </div>
                  </div>
                </div>

                {/* Pool Allocation Breakdown Tiers (§07) */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center">5</span>
                      <div>
                        <span className="font-semibold text-white">5-Number Match (Jackpot)</span>
                        <p className="text-[10px] text-slate-400">40% Share + Rollover</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      ${(currentDraw?.tierAllocation.match5.poolAmount || 19400).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[11px] flex items-center justify-center">4</span>
                      <div>
                        <span className="font-semibold text-white">4-Number Match</span>
                        <p className="text-[10px] text-slate-400">35% Share (Equal split)</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      ${(currentDraw?.tierAllocation.match4.poolAmount || 9975).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center">3</span>
                      <div>
                        <span className="font-semibold text-white">3-Number Match</span>
                        <p className="text-[10px] text-slate-400">25% Share (Equal split)</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      ${(currentDraw?.tierAllocation.match3.poolAmount || 7125).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={user ? () => setCurrentTab('dashboard') : openSubscribeModal}
                  className="w-full mt-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20 text-center"
                >
                  {user ? 'View Your 5 Draw Numbers' : 'Subscribe To Enter This Draw'}
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 02: The 4 Pillars of Digital Heroes (§01.1 & §02) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Engineered For Purpose, Not Clichés
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Digital Heroes eliminates traditional golf imagery in favor of a sleek, modern subscription engine connecting genuine handicap performance to real charitable impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all card-glow-amber">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Subscription Model
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flexible monthly ($29) or discounted yearly ($290) plans. Real-time subscription entitlement check ensures active players fuel the draw.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all card-glow-indigo">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              5-Score Rolling Logic
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter Stableford scores between 1 and 45. A strict 5-score FIFO window automatically cycles your numbers into each month's draw pool.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all card-glow-amber">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Rollover Jackpot Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Match 5, 4, or 3 numbers. The 40% 5-match jackpot carries forward automatically if unclaimed, creating high-stakes anticipation.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              10% Minimum Giving
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              At least 10% of every subscription goes directly to veteran reintegration, pediatric oncology, or youth grants. Voluntarily raise your share anytime.
            </p>
          </div>

        </div>
      </section>

      {/* Section 03: Featured Charity Spotlight (§08.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-semibold text-amber-400 tracking-wider mb-1">
              Charity Spotlight (§08.2)
            </div>
            <h2 className="font-display text-3xl font-bold text-white">
              Causes Leading Our Story
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('charities')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Directory (5 Causes)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {spotlightCharities.map(charity => (
            <div 
              key={charity.id}
              className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all group flex flex-col"
            >
              {/* Banner Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={charity.bannerUrl} 
                  alt={charity.name}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-amber-400">
                  {charity.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={charity.logoUrl} 
                      alt="" 
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-9 h-9 rounded-lg object-cover border border-white/10" 
                    />
                    <h3 className="font-display text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {charity.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {charity.tagline}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {charity.description}
                  </p>
                </div>

                {/* Impact Statement callout */}
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs text-amber-300">
                  <span className="font-semibold text-amber-400">Impact: </span>
                  {charity.impactStatement}
                </div>

                {/* Footer action bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Raised so far</div>
                    <div className="text-sm font-bold font-display text-white">
                      ${charity.totalRaised.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDonateModal(charity)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      Direct Gift
                    </button>
                    <button
                      onClick={() => setCurrentTab('charities')}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
                    >
                      Details & Events
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 04: Fair Play, Verification & Transparency (§09 & §06) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
                Integrity Engine (§09)
              </div>
              <h2 className="font-display text-3xl font-bold text-white">
                How Winners Are Audited & Paid
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We believe in 100% fair play. Every winning ticket requires verified scorecard proof from certified golf platforms (GHIN, Golf Genius, WHS) before prize disbursement.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300">
                    <strong className="text-white">Screenshot Submission:</strong> Winners upload official scorecard images directly from their club scoring app.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300">
                    <strong className="text-white">Admin Audit:</strong> Platform administrators verify Stableford point allocations and dates before approving payout.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300">
                    <strong className="text-white">Automated Payout State:</strong> Status progresses transparently from <em>Pending</em> to <em>Approved</em> to <em>Paid</em> with transaction hashes.
                  </span>
                </div>
              </div>
            </div>

            {/* Live Winners Ticker Showcase */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>Recent Draw Winner Claims</span>
                <span className="text-emerald-400">Verified Payouts</span>
              </div>

              {recentWinners.slice(0, 3).map(w => (
                <div key={w.id} className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{w.userName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {w.matchType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{w.drawMonth} Draw</p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-emerald-400">
                      +${w.prizeAmount.toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-semibold uppercase ${
                      w.payoutStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {w.payoutStatus === 'paid' ? 'Paid out' : 'Under review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Section 05: Bottom Persuasive Subscription CTA (§12 & §04) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white">
          Ready to Turn Your Scorecard <br />
          <span className="gold-gradient-text">Into Life-Changing Impact?</span>
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Join hundreds of golfers backing veteran recovery, cancer breakthroughs, and junior scholarships while competing for monthly rollover jackpots.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={openSubscribeModal}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-black font-bold text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Join Digital Heroes ($29/mo or $290/yr)
          </button>
          
          {!user && (
            <button
              onClick={openAuthModal}
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 text-sm font-semibold transition-all"
            >
              Sign In to Existing Account
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
