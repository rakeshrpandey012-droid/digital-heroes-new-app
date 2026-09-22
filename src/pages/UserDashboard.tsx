import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Heart, 
  Calendar, 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  Flame,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Score, Winner, Draw, PaymentMethodInfo } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ScoreModal } from '../components/ScoreModal.tsx';
import { ProofUploadModal } from '../components/ProofUploadModal.tsx';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector.tsx';

interface UserDashboardProps {
  openSubscribeModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ openSubscribeModal, setCurrentTab }) => {
  const { user, token, toggleSubscription, updateCharity, updatePaymentMethod } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [ticketCheck, setTicketCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedWinnerForProof, setSelectedWinnerForProof] = useState<Winner | null>(null);

  // Payment methods state
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [tempPaymentMethod, setTempPaymentMethod] = useState<PaymentMethodInfo>(
    user?.paymentMethod || {
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expMonth: '12',
      expYear: '2028',
      cardholderName: user?.name || 'Marcus Vance',
      isDefault: true
    }
  );

  // Charity percentage state
  const [charityPct, setCharityPct] = useState<number>(user?.charitySelection?.percentage || 15);
  const [savingCharity, setSavingCharity] = useState(false);
  const [charitySaveSuccess, setCharitySaveSuccess] = useState(false);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch Scores
      const scoreRes = await fetch('/api/scores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const scoreData = await scoreRes.json();
      if (scoreData.success) setScores(scoreData.scores);

      // 2. Fetch Winnings
      const winRes = await fetch('/api/winners/my-winnings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const winData = await winRes.json();
      if (winData.success) setWinnings(winData.winnings);

      // 3. Fetch Current Draw
      const drawRes = await fetch('/api/draws/current');
      const drawData = await drawRes.json();
      if (drawData.success) setCurrentDraw(drawData.draw);

      // 4. Check Ticket Numbers against latest draw
      const checkRes = await fetch('/api/draws/check-ticket', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const checkData = await checkRes.json();
      if (checkData.success) setTicketCheck(checkData);

    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    if (user?.charitySelection?.percentage) {
      setCharityPct(user.charitySelection.percentage);
    }
  }, [user]);

  const handleDeleteScore = async (scoreId: string) => {
    if (!token) return;
    if (!window.confirm('Delete this score entry?')) return;

    try {
      const res = await fetch(`/api/scores/${scoreId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCharityPercentage = async () => {
    if (!user) return;
    setSavingCharity(true);
    const success = await updateCharity(user.charitySelection.charityId, charityPct);
    setSavingCharity(false);
    if (success) {
      setCharitySaveSuccess(true);
      setTimeout(() => setCharitySaveSuccess(false), 3000);
    }
  };

  const handleSavePaymentMethod = async () => {
    setSavingPayment(true);
    setPaymentSuccessMsg(null);
    try {
      const success = await updatePaymentMethod(tempPaymentMethod);
      if (success) {
        setPaymentSuccessMsg('Payment method saved and set as primary default.');
        setTimeout(() => {
          setShowPaymentSelector(false);
          setPaymentSuccessMsg(null);
        }, 1800);
      }
    } catch {
      //
    } finally {
      setSavingPayment(false);
    }
  };

  const totalPrizeWon = winnings.reduce((acc, w) => acc + w.prizeAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Welcome & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Subscriber Member Portal (§10)</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Welcome Back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Handicap: {user?.handicap || 14.2} · Home Club: {user?.homeClub || 'Spyglass Dunes Links'}
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingScore(null); setScoreModalOpen(true); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Stableford Score
          </button>
        </div>
      </div>

      {/* Grid: 5 Core PRD Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Score Management & Participation */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Module 1: Score Management Interface (§05 & §10.2) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display text-lg font-bold text-white">
                    Score Management System
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                    {scores.length} / 5 Logged
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Stableford 1–45 · Reverse chronological order · Rolling 5-score replacement logic
                </p>
              </div>

              <button
                onClick={() => { setEditingScore(null); setScoreModalOpen(true); }}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Round
              </button>
            </div>

            {/* Active Ticket Numbers Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Your Active Draw Ticket Numbers (Latest 5 Scores)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {scores.length === 5 ? '✓ 5-Number Ticket Complete' : `⚠️ Enter ${5 - scores.length} more to complete ticket`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {[0, 1, 2, 3, 4].map(idx => {
                  const s = scores[idx];
                  return (
                    <div 
                      key={idx}
                      className={`flex-1 h-14 rounded-xl border flex flex-col items-center justify-center font-mono transition-all ${
                        s 
                          ? 'border-amber-500/40 bg-amber-500/10 text-white font-bold' 
                          : 'border-white/10 bg-white/5 text-slate-600 border-dashed'
                      }`}
                    >
                      <span className="text-lg font-bold text-amber-400">{s ? s.score : '—'}</span>
                      <span className="text-[9px] text-slate-400 font-sans">{s ? s.date.slice(5) : 'Slot ' + (idx + 1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scorecard List */}
            {scores.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl space-y-3">
                <Target className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No Stableford scores entered yet.</p>
                <button
                  onClick={() => { setEditingScore(null); setScoreModalOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs"
                >
                  Log Your First Score
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((sc, i) => (
                  <div 
                    key={sc.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold text-base flex items-center justify-center border border-amber-500/30">
                        {sc.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{sc.courseName}</span>
                          <span className="text-[10px] text-slate-400">({sc.holesPlayed} Holes)</span>
                          {i === 0 && (
                            <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{sc.date}</span>
                          {sc.notes && <span>· {sc.notes}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingScore(sc); setScoreModalOpen(true); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit score"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScore(sc.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete score"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Module 2: Participation Summary (§10.4 & §06) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Draw Participation & Mechanics
                </h3>
              </div>
              <span className="text-xs text-indigo-300 font-mono">
                {currentDraw?.month || 'March 2026'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Pool</span>
                <div className="text-xl font-bold font-display text-amber-400">
                  ${(currentDraw?.totalPool || 28500).toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500">40% / 35% / 25% Split</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Rollover Jackpot</span>
                <div className="text-xl font-bold font-display text-white">
                  ${(currentDraw?.rolloverAmount || 8000).toLocaleString()}
                </div>
                <p className="text-[10px] text-amber-400">Unclaimed Feb rollover</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Subscribers Competing</span>
                <div className="text-xl font-bold font-display text-white">
                  {(currentDraw?.subscribersCount || 1120).toLocaleString()}
                </div>
                <p className="text-[10px] text-emerald-400">All active scorecards</p>
              </div>
            </div>

            {/* Past draw performance checker (§06) */}
            {ticketCheck?.latestDraw && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Ticket Match Comparison (Last Published Draw: {ticketCheck.latestDraw.month})
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    ticketCheck.latestDraw.isWinner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ticketCheck.latestDraw.tier}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400">Winning Numbers:</span>
                  {ticketCheck.latestDraw.winningNumbers.map((n: number) => {
                    const isMatched = ticketCheck.ticketNumbers.includes(n);
                    return (
                      <span 
                        key={n}
                        className={`w-7 h-7 rounded-full font-bold flex items-center justify-center font-mono ${
                          isMatched 
                            ? 'bg-amber-400 text-black border-2 border-amber-300 shadow-md shadow-amber-400/40' 
                            : 'bg-slate-800 text-slate-300 border border-white/10'
                        }`}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Winnings Overview & Verification (§09 & §10.5) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Winnings & Official Verification (§09)
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block">Total Prize Won</span>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  ${totalPrizeWon.toLocaleString()}
                </span>
              </div>
            </div>

            {winnings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-xs text-slate-400">
                No prize winnings claimed yet. Your 5 numbers are actively competing in the upcoming draw!
              </div>
            ) : (
              <div className="space-y-3">
                {winnings.map(w => (
                  <div key={w.id} className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{w.drawMonth} Draw</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-xs uppercase border border-amber-500/30">
                            {w.matchType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Matched Numbers: {w.matchedNumbers.join(', ')}
                        </p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                        <span className="font-mono font-extrabold text-emerald-400 text-lg">
                          ${w.prizeAmount.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400">Payout:</span>
                          <span className={`font-semibold capitalize ${
                            w.payoutStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {w.payoutStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Status Banner */}
                    <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Audit Status: </span>
                        <span className={`font-semibold capitalize ${
                          w.verificationStatus === 'approved' 
                            ? 'text-emerald-400' 
                            : w.verificationStatus === 'rejected' 
                            ? 'text-rose-400' 
                            : 'text-amber-400'
                        }`}>
                          {w.verificationStatus}
                        </span>
                        {w.adminNotes && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Note: {w.adminNotes}
                          </span>
                        )}
                      </div>

                      {/* Proof Action button */}
                      {w.payoutStatus !== 'paid' && (
                        <button
                          onClick={() => { setSelectedWinnerForProof(w); setProofModalOpen(true); }}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          {w.proofUrl ? 'Update Scorecard Proof' : 'Upload Scorecard Proof'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Subscription & Charity Selection */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Module 4: Subscription Status & Payment (§10.1 & §04) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display text-lg font-bold text-white">
                Subscription Status
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Entitlement Status</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                  user?.subscription.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {user?.subscription.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Plan Tier</span>
                <span className="text-white font-semibold capitalize">
                  {user?.subscription.plan} (${user?.subscription.plan === 'yearly' ? '290 / yr' : '29 / mo'})
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Next Renewal Date</span>
                <span className="text-slate-200 font-mono">
                  {user?.subscription.renewalDate ? user.subscription.renewalDate.slice(0, 10) : '2027-01-15'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={openSubscribeModal}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5"
              >
                Change Plan Tier (Upgrade / Discount)
              </button>

              <button
                onClick={toggleSubscription}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              >
                {user?.subscription.status === 'active' ? 'Simulate Cancel / Lapsed Status' : 'Reactivate Subscription'}
              </button>
            </div>
          </div>

          {/* Module: Payment Methods & Billing Vault */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Payment Methods
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentSelector(!showPaymentSelector)}
                className="text-[11px] text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{showPaymentSelector ? 'Cancel' : 'Manage / Add'}</span>
              </button>
            </div>

            {paymentSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{paymentSuccessMsg}</span>
              </div>
            )}

            {/* Active Primary Payment Method Display */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold text-[9px] font-mono flex items-center justify-center uppercase tracking-tighter shadow-sm">
                    {user?.paymentMethod?.brand?.slice(0, 4) || 'VISA'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{user?.paymentMethod?.brand || 'Visa'} •••• {user?.paymentMethod?.last4 || '4242'}</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-bold uppercase">
                        Default
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {user?.paymentMethod?.cardholderName || user?.name || 'Marcus Vance'} 
                      {user?.paymentMethod?.expMonth ? ` · Exp ${user.paymentMethod.expMonth}/${user.paymentMethod.expYear}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected secondary methods */}
              {user?.paymentMethods && user.paymentMethods.length > 1 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Backup Payment Sources
                  </span>
                  {user.paymentMethods.filter(p => !p.isDefault).map((pm, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-300 py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[10px]">{pm.brand}</span>
                        <span>•••• {pm.last4 || '8831'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Verified</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inline Payment Method Selector */}
            {showPaymentSelector ? (
              <div className="pt-3 border-t border-white/10 space-y-4 animate-in fade-in duration-150">
                <PaymentMethodSelector
                  value={tempPaymentMethod}
                  onChange={setTempPaymentMethod}
                  compact={true}
                  actionButtonText="Save as Primary Payment Method"
                  onConfirm={handleSavePaymentMethod}
                  isLoading={savingPayment}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPaymentSelector(true)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Update Card or Add Digital Wallet</span>
              </button>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Stripe PCI-DSS Vault
              </span>
              <span>Encrypted Tokenization</span>
            </div>
          </div>

          {/* Module 5: Selected Charity & Contribution Percentage (§10.3 & §08) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Giving Allocation
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab('charities')}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Switch Cause
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Designated Charity</span>
              <p className="text-sm font-bold text-white">
                {user?.charitySelection.charityName || 'Fore Hope Veterans Foundation'}
              </p>
              <p className="text-[11px] text-slate-400">
                A percentage of each subscription payment is routed directly to this verified partner.
              </p>
            </div>

            {/* Slider (§08.1: Minimum 10%, voluntarily increase) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Your Monthly Contribution Share</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {charityPct}%
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={charityPct}
                onChange={e => setCharityPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% (Mandatory min)</span>
                <span>25%</span>
                <span>50%</span>
                <span>100% (Pure impact)</span>
              </div>
            </div>

            <button
              onClick={handleSaveCharityPercentage}
              disabled={savingCharity || charityPct === user?.charitySelection.percentage}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-sm shadow-amber-500/20 disabled:opacity-50"
            >
              {savingCharity ? 'Updating...' : charitySaveSuccess ? '✓ Allocation Saved' : 'Confirm Giving Percentage'}
            </button>
          </div>

        </div>

      </div>

      {/* Modals */}
      <ScoreModal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        editingScore={editingScore}
        onScoreSaved={fetchDashboardData}
        token={token}
        existingScores={scores}
      />

      <ProofUploadModal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        winner={selectedWinnerForProof}
        token={token}
        onUploadSuccess={fetchDashboardData}
      />

    </div>
  );
};
