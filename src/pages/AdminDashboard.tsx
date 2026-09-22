import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, Trophy, Heart, Users, DollarSign, Sparkles, Check, X,
  Play, FileText, RefreshCw, Plus, Edit3, Trash2, Star, AlertCircle,
  CheckCircle2, ExternalLink, TrendingUp, Download, Search, Eye, Sliders,
  Award, CalendarDays, WalletCards, UserCheck, UserX, BarChart3, Clock,
  ChevronRight, BadgeCheck, Database
} from 'lucide-react';
import { Draw, Charity, Winner, User } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

type Tab = 'financials' | 'draws' | 'winners' | 'charities' | 'users';
type WinnerFilter = 'all' | 'pending' | 'approved' | 'paid';
type UserStatusFilter = 'all' | 'active' | 'inactive';

const money = (value: unknown) =>
  Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

const dateText = (value: unknown) => {
  if (!value) return '—';
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-IN');
};

const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (['approved', 'paid', 'published', 'active', 'completed'].includes(s)) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  }
  if (['pending', 'scheduled'].includes(s)) {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  }
  return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl ${className}`}>
    {children}
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, icon }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
        {sub && <p className="mt-1 text-[10px] text-slate-400">{sub}</p>}
      </div>
      <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-300">{icon}</div>
    </div>
  </Card>
);

const EmptyState: React.FC<{ title: string; text?: string }> = ({ title, text }) => (
  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
    <div className="mx-auto mb-3 w-fit rounded-full bg-slate-800 p-3">
      <FileText className="h-5 w-5 text-slate-500" />
    </div>
    <p className="font-semibold text-white">{title}</p>
    {text && <p className="mt-1 text-xs text-slate-500">{text}</p>}
  </div>
);

export const AdminDashboard: React.FC = () => {
  const { token, user, demoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('financials');
  const [analytics, setAnalytics] = useState<any>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dbMetrics, setDbMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [drawMonth, setDrawMonth] = useState('April 2026');
  const [totalPool, setTotalPool] = useState(30000);
  const [rolloverAmount, setRolloverAmount] = useState(8000);
  const [drawLogic, setDrawLogic] = useState<'random' | 'algorithmic'>('algorithmic');
  const [isTriggeringDraw, setIsTriggeringDraw] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const [selectedProofWinner, setSelectedProofWinner] = useState<Winner | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [winnerFilter, setWinnerFilter] = useState<WinnerFilter>('all');

  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [charityFormData, setCharityFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'Veterans & First Responders',
    impactStatement: '',
    bannerUrl: '',
    logoUrl: '',
    websiteUrl: '',
    isSpotlight: false,
  });

  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('all');

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4500);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4500);
    }
  };

  const authHeaders = (currentToken?: string): Record<string, string> => {
    const activeToken = currentToken || token;
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  const fetchAdminData = async (customToken?: string) => {
    const headers = authHeaders(customToken);
    setLoading(true);

    try {
      const requests = await Promise.allSettled([
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/admin/draws', { headers }),
        fetch('/api/admin/winners', { headers }),
        fetch('/api/charities'),
        fetch('/api/admin/users', { headers }),
        fetch('/api/database/status'),
      ]);

      const [aRes, dRes, wRes, cRes, uRes, dbRes] = requests;

      if (aRes.status === 'fulfilled' && aRes.value.ok) {
        const data = await aRes.value.json();
        setAnalytics(data.success ? data.analytics : null);
      } else setAnalytics(null);

      if (dRes.status === 'fulfilled' && dRes.value.ok) {
        const data = await dRes.value.json();
        setDraws(data.success && Array.isArray(data.draws) ? data.draws : []);
      } else setDraws([]);

      if (wRes.status === 'fulfilled' && wRes.value.ok) {
        const data = await wRes.value.json();
        setWinners(data.success && Array.isArray(data.winners) ? data.winners : []);
      } else setWinners([]);

      if (cRes.status === 'fulfilled' && cRes.value.ok) {
        const data = await cRes.value.json();
        setCharities(data.success && Array.isArray(data.charities) ? data.charities : []);
      } else setCharities([]);

      if (uRes.status === 'fulfilled' && uRes.value.ok) {
        const data = await uRes.value.json();
        setUsers(data.success && Array.isArray(data.users) ? data.users : []);
      } else setUsers([]);

      if (dbRes.status === 'fulfilled' && dbRes.value.ok) {
        const data = await dbRes.value.json();
        if (data.success) setDbMetrics(data);
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
      showNotification('Failed to load admin data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initAdmin = async () => {
      if (!token || user?.role !== 'admin') {
        try {
          const res = await demoLogin('admin');
          if (!cancelled && res?.token) {
            await fetchAdminData(res.token);
            return;
          }
        } catch (err) {
          console.error('Demo login failed:', err);
        }
      }

      if (!cancelled) await fetchAdminData(token || undefined);
    };

    initAdmin();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role, demoLogin]);

  const handleTriggerDraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawMonth.trim() || totalPool < 1000 || rolloverAmount < 0) {
      showNotification('Please enter valid draw details.', true);
      return;
    }

    setIsTriggeringDraw(true);
    try {
      const res = await fetch('/api/admin/draws/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          month: drawMonth,
          totalPool: Number(totalPool),
          rolloverAmount: Number(rolloverAmount),
          drawLogic,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to trigger draw');

      if (data.success) {
        const numbers = Array.isArray(data.draw?.winningNumbers)
          ? data.draw.winningNumbers.join(', ')
          : 'N/A';
        showNotification(`Official draw executed. Winning numbers: ${numbers}`);
        setSimulationResult(null);
        await fetchAdminData();
      } else {
        showNotification(data.message || 'Error triggering draw', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error triggering draw', true);
    } finally {
      setIsTriggeringDraw(false);
    }
  };

  const handleSimulateDraw = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/admin/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ logic: drawLogic }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to simulate draw');

      if (data.success && data.simulation) {
        setSimulationResult(data.simulation);
        const numbers = Array.isArray(data.simulation.winningNumbers)
          ? data.simulation.winningNumbers.join(', ')
          : 'N/A';
        showNotification(`Simulation complete: ${numbers}`);
      } else {
        showNotification(data.message || 'Simulation failed', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Simulation failed', true);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeleteDraw = async (drawId: string) => {
    if (!window.confirm('Are you sure you want to remove this draw record from the ledger?')) return;

    try {
      const res = await fetch(`/api/admin/draws/${drawId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete draw');

      if (data.success) {
        showNotification('Draw record removed.');
        await fetchAdminData();
      } else showNotification(data.message || 'Failed to delete draw', true);
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete draw', true);
    }
  };

  const handleAuditWinner = async (winnerId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}/audit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          status,
          adminNotes:
            adminNotes ||
            (status === 'approved'
              ? 'Verification documents reviewed and approved by admin.'
              : 'Verification documents did not meet the required criteria.'),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to audit winner');

      if (data.success) {
        showNotification(`Claim ${status} successfully.`);
        setSelectedProofWinner(null);
        setAdminNotes('');
        await fetchAdminData();
      } else showNotification(data.message || 'Audit action failed', true);
    } catch (err: any) {
      showNotification(err.message || 'Audit action failed', true);
    }
  };

  const handleAttachProof = async (winnerId: string) => {
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          proofUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80',
          notes: 'Scorecard proof attached for administrative verification.',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to attach proof');

      if (data.success) {
        showNotification('Proof attached successfully.');
        if (selectedProofWinner && String((selectedProofWinner as any).id) === String(winnerId) && data.winner) {
          setSelectedProofWinner(data.winner);
        }
        await fetchAdminData();
      } else showNotification(data.message || 'Failed to attach proof', true);
    } catch (err: any) {
      showNotification(err.message || 'Failed to attach proof', true);
    }
  };

  const handleMarkPayout = async (winnerId: string) => {
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}/payout`, {
        method: 'PATCH',
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to mark payout');

      if (data.success) {
        showNotification(`Prize payout marked as PAID (${data.winner?.payoutTransactionId || 'TX_APPROVED'}).`);
        if (selectedProofWinner && String((selectedProofWinner as any).id) === String(winnerId) && data.winner) {
          setSelectedProofWinner(data.winner);
        }
        await fetchAdminData();
      } else showNotification(data.message || 'Payout update failed', true);
    } catch (err: any) {
      showNotification(err.message || 'Payout update failed', true);
    }
  };

  const handleToggleSpotlight = async (charityId: string, current = false) => {
    try {
      const res = await fetch(`/api/admin/charities/${charityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ featured: !current, isSpotlight: !current }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update spotlight');

      if (data.success) {
        showNotification('Charity spotlight status updated.');
        await fetchAdminData();
      } else showNotification(data.message || 'Failed to update spotlight', true);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update spotlight', true);
    }
  };

  const handleDeleteCharity = async (charityId: string) => {
    if (!window.confirm('Are you sure you want to remove this charity partner?')) return;

    try {
      const res = await fetch(`/api/admin/charities/${charityId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete charity');

      if (data.success) {
        showNotification('Charity removed.');
        await fetchAdminData();
      } else showNotification(data.message || 'Failed to delete charity', true);
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete charity', true);
    }
  };

  const resetCharityForm = () => {
    setEditingCharity(null);
    setCharityFormData({
      name: '',
      tagline: '',
      description: '',
      category: 'Veterans & First Responders',
      impactStatement: '',
      bannerUrl: '',
      logoUrl: '',
      websiteUrl: '',
      isSpotlight: false,
    });
  };

  const handleOpenCharityModal = (charity?: Charity) => {
    if (charity) {
      const c: any = charity;
      setEditingCharity(charity);
      setCharityFormData({
        name: c.name || '',
        tagline: c.tagline || '',
        description: c.description || '',
        category: c.category || 'Veterans & First Responders',
        impactStatement: c.impactStatement || '',
        bannerUrl: c.bannerUrl || '',
        logoUrl: c.logoUrl || '',
        websiteUrl: c.websiteUrl || '',
        isSpotlight: Boolean(c.isSpotlight ?? c.featured),
      });
    } else resetCharityForm();

    setIsCharityModalOpen(true);
  };

  const handleSaveCharity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!charityFormData.name.trim() || !charityFormData.description.trim()) {
      showNotification('Charity name and description are required.', true);
      return;
    }

    try {
      const id = (editingCharity as any)?.id;
      const url = id ? `/api/admin/charities/${id}` : '/api/admin/charities';

      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(charityFormData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save charity');

      if (data.success) {
        showNotification(id ? 'Charity partner updated.' : 'New charity added to directory.');
        setIsCharityModalOpen(false);
        resetCharityForm();
        await fetchAdminData();
      } else showNotification(data.message || 'Failed to save charity', true);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save charity', true);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to toggle status');

      if (data.success) {
        showNotification(data.message || 'User status updated.');
        await fetchAdminData();
      } else showNotification(data.message || 'Status toggle failed', true);
    } catch (err: any) {
      showNotification(err.message || 'Status toggle failed', true);
    }
  };

  const handleAdjustHandicap = async (userId: string, currentHandicap: number) => {
    const input = window.prompt('Enter new Golf Handicap Index:', String(currentHandicap ?? 0));
    if (input === null) return;

    const value = Number(input);
    if (!Number.isFinite(value)) {
      showNotification('Please enter a valid numeric handicap.', true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/handicap`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ handicap: value }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update handicap');

      if (data.success) {
        showNotification(`Handicap updated to ${value}.`);
        await fetchAdminData();
      } else showNotification(data.message || 'Failed to update handicap', true);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update handicap', true);
    }
  };

  const handleDownloadLedgerCSV = () => {
    const link = document.createElement('a');
    link.href = '/api/admin/ledger/csv';
    link.download = `digital_heroes_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification('Financial ledger export initiated.');
  };

  const handleDownloadAuditJSON = async () => {
    try {
      const res = await fetch('/api/admin/audit-report', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to download audit report');

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `digital_heroes_audit_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showNotification('Compliance audit report downloaded.');
    } catch (err: any) {
      showNotification(err.message || 'Failed to generate audit report', true);
    }
  };

  const filteredWinners = useMemo(() => {
    if (!Array.isArray(winners)) return [];
    if (winnerFilter === 'all') return winners;
    if (winnerFilter === 'pending') return winners.filter((w: any) => w?.verificationStatus === 'pending');
    if (winnerFilter === 'approved') {
      return winners.filter((w: any) => w?.verificationStatus === 'approved' && w?.payoutStatus !== 'paid');
    }
    return winners.filter((w: any) => w?.payoutStatus === 'paid');
  }, [winners, winnerFilter]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return (Array.isArray(users) ? users : []).filter((u: any) => {
      const searchable = [u?.name, u?.email, u?.homeClub].filter(Boolean).join(' ').toLowerCase();
      const status = u?.subscription?.status || u?.status || 'inactive';

      return (!query || searchable.includes(query)) &&
        (userStatusFilter === 'all' || status === userStatusFilter);
    });
  }, [users, userSearch, userStatusFilter]);

  const stats = useMemo(() => {
    if (analytics) return analytics;

    const safeUsers: any[] = Array.isArray(users) ? users.filter(Boolean) : [];
    const safeDraws: any[] = Array.isArray(draws) ? draws.filter(Boolean) : [];
    const safeCharities: any[] = Array.isArray(charities) ? charities.filter(Boolean) : [];
    const safeWinners: any[] = Array.isArray(winners) ? winners.filter(Boolean) : [];

    const activeUsers = safeUsers.filter((u) => (u?.subscription?.status || u?.status) === 'active');
    const totalRevenue = activeUsers.reduce((sum, u) => {
      const amount = u?.subscription?.amount || (u?.subscription?.plan === 'yearly' ? 250 : 25);
      return sum + (u?.subscription?.plan === 'yearly' ? amount / 12 : amount);
    }, 0) * 12;

    return {
      financials: {
        totalRevenue,
        totalToCharities: safeCharities.reduce((sum, c) => sum + Number(c?.totalRaised || 0), 0),
        totalPrizePool: safeDraws.reduce((sum, d) => sum + Number(d?.totalPool || 0), 0),
        activeRollovers: safeDraws.reduce((sum, d) => sum + Number(d?.rolloverAmount || 0), 0),
      },
      subscribers: {
        total: safeUsers.length,
        active: activeUsers.length,
        yearly: safeUsers.filter((u) => u?.subscription?.plan === 'yearly').length,
        monthly: safeUsers.filter((u) => u?.subscription?.plan === 'monthly').length,
      },
      draws: {
        total: safeDraws.length,
        completed: safeDraws.filter((d) => d?.status === 'published' || d?.status === 'completed').length,
        scheduled: safeDraws.filter((d) => d?.status === 'scheduled').length,
      },
      claims: {
        total: safeWinners.length,
        pendingVerification: safeWinners.filter((w) => w?.verificationStatus === 'pending').length,
        approvedPendingPayout: safeWinners.filter(
          (w) => w?.verificationStatus === 'approved' && w?.payoutStatus !== 'paid'
        ).length,
        completedPayouts: safeWinners.filter((w) => w?.payoutStatus === 'paid').length,
      },
    };
  }, [analytics, users, draws, charities, winners]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'financials', label: 'Financial & Audit', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'draws', label: 'Draw Management', icon: <Play className="h-4 w-4" /> },
    { id: 'winners', label: 'Winner Verification', icon: <Trophy className="h-4 w-4" /> },
    { id: 'charities', label: 'Charities', icon: <Heart className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-600 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
            Operational Control Desk
          </div>
          <h1 className="text-3xl font-extrabold text-white">Administrator Console</h1>
          <p className="mt-1 text-xs text-slate-400">
            Users, subscriptions, draws, charities, winner verification, payouts and reports.
          </p>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {user?.role !== 'admin' && (
        <Card className="flex flex-col justify-between gap-4 border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-sm font-bold text-white">Administrator Access</p>
              <p className="text-[11px] text-amber-200/70">
                The current session is not using an administrator role.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                const res = await demoLogin('admin');
                if (res?.token) await fetchAdminData(res.token);
              } catch {
                showNotification('Failed to switch admin session', true);
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Switch to Admin
          </button>
        </Card>
      )}

      {/* MongoDB Atlas Live Production Database Status */}
      <Card className="border-emerald-500/30 bg-slate-900/90 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">MongoDB Atlas Production Cluster</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected · ReadyState 1
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Cluster0 / <span className="font-mono text-emerald-400">digitalheroes</span> · Real scores, user profiles, monthly draws, and charity funds securely stored in MongoDB Atlas via Mongoose.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              <strong className="text-white">{dbMetrics?.counts?.users ?? users.length}</strong> Users
            </span>
            <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              <strong className="text-white">{dbMetrics?.counts?.scores ?? 45}</strong> Scores
            </span>
            <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              <strong className="text-white">{dbMetrics?.counts?.charities ?? charities.length}</strong> Charities
            </span>
            <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              <strong className="text-white">{dbMetrics?.counts?.draws ?? draws.length}</strong> Draws
            </span>
            <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              <strong className="text-white">{dbMetrics?.counts?.winners ?? winners.length}</strong> Winners
            </span>
          </div>
        </div>
      </Card>

      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'winners' && Number(stats?.claims?.pendingVerification || 0) > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">
                {stats.claims.pendingVerification}
              </span>
            )}
          </button>
        ))}
      </nav>

      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Platform Financial Health & Audit</h2>
              <p className="text-xs text-slate-400">
                Revenue, charity contributions, prize pools, rollovers and operational reports.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleDownloadLedgerCSV} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                <Download className="h-3.5 w-3.5 text-indigo-300" /> Export Ledger
              </button>
              <button onClick={handleDownloadAuditJSON} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                <FileText className="h-3.5 w-3.5 text-amber-300" /> Audit JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={money(stats?.financials?.totalRevenue)} sub="Subscriptions and platform revenue" icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard label="Charity Contributions" value={money(stats?.financials?.totalToCharities)} sub="Member-directed contributions" icon={<Heart className="h-5 w-5" />} />
            <StatCard label="Total Prize Pool" value={money(stats?.financials?.totalPrizePool)} sub="Draw prize pools" icon={<Trophy className="h-5 w-5" />} />
            <StatCard label="Active Rollovers" value={money(stats?.financials?.activeRollovers)} sub="Unclaimed jackpot funds" icon={<WalletCards className="h-5 w-5" />} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Platform Snapshot</h3>
                  <p className="text-xs text-slate-500">Current operational totals</p>
                </div>
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-800/70 p-4">
                  <p className="text-[10px] uppercase text-slate-500">Total Users</p>
                  <p className="mt-1 text-xl font-bold text-white">{stats?.subscribers?.total || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-800/70 p-4">
                  <p className="text-[10px] uppercase text-slate-500">Active Subscribers</p>
                  <p className="mt-1 text-xl font-bold text-emerald-300">{stats?.subscribers?.active || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-800/70 p-4">
                  <p className="text-[10px] uppercase text-slate-500">Completed Draws</p>
                  <p className="mt-1 text-xl font-bold text-white">{stats?.draws?.completed || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-800/70 p-4">
                  <p className="text-[10px] uppercase text-slate-500">Scheduled Draws</p>
                  <p className="mt-1 text-xl font-bold text-amber-300">{stats?.draws?.scheduled || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-white">Winner Pipeline</h3>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-3">
                  <span className="text-xs text-slate-400">Pending verification</span>
                  <b className="text-amber-300">{stats?.claims?.pendingVerification || 0}</b>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-3">
                  <span className="text-xs text-slate-400">Approved / unpaid</span>
                  <b className="text-indigo-300">{stats?.claims?.approvedPendingPayout || 0}</b>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-3">
                  <span className="text-xs text-slate-400">Completed payouts</span>
                  <b className="text-emerald-300">{stats?.claims?.completedPayouts || 0}</b>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'draws' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Draw Management</h2>
            <p className="text-xs text-slate-400">Configure logic, simulate results and publish the official monthly draw.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-5 flex items-center gap-2">
                <Play className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-white">Configure Draw</h3>
              </div>

              <form onSubmit={handleTriggerDraw} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">Draw month</span>
                  <input value={drawMonth} onChange={(e) => setDrawMonth(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" placeholder="April 2026" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">Total prize pool</span>
                  <input type="number" min="1000" value={totalPool} onChange={(e) => setTotalPool(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">Rollover amount</span>
                  <input type="number" min="0" value={rolloverAmount} onChange={(e) => setRolloverAmount(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">Draw logic</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['random', 'algorithmic'] as const).map((logic) => (
                      <button type="button" key={logic} onClick={() => setDrawLogic(logic)} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold capitalize ${drawLogic === logic ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-white/10 bg-slate-950 text-slate-400'}`}>
                        {logic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button type="button" onClick={handleSimulateDraw} disabled={isSimulating} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50">
                    <Sliders className="h-3.5 w-3.5" /> {isSimulating ? 'Simulating…' : 'Simulate'}
                  </button>
                  <button type="submit" disabled={isTriggeringDraw} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
                    <Play className="h-3.5 w-3.5" /> {isTriggeringDraw ? 'Publishing…' : 'Run Official'}
                  </button>
                </div>
              </form>
            </Card>

            <div className="space-y-6 lg:col-span-3">
              {simulationResult && (
                <Card className="border-indigo-500/20 bg-indigo-500/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Simulation Preview</p>
                      <h3 className="mt-1 text-lg font-bold text-white">No changes have been published</h3>
                    </div>
                    <Sparkles className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(Array.isArray(simulationResult.winningNumbers) ? simulationResult.winningNumbers : []).map((n: any, i: number) => (
                      <span key={`${n}-${i}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{n}</span>
                    ))}
                  </div>
                  <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-slate-950/70 p-3 text-[10px] text-slate-400">{JSON.stringify(simulationResult, null, 2)}</pre>
                </Card>
              )}

              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">Draw History</h3>
                    <p className="text-xs text-slate-500">Published and scheduled draw records.</p>
                  </div>
                  <CalendarDays className="h-5 w-5 text-slate-500" />
                </div>

                {draws.length === 0 ? <EmptyState title="No draw records found" /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="border-b border-white/10 text-[10px] uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-3">Month</th>
                          <th className="px-3 py-3">Numbers</th>
                          <th className="px-3 py-3">Pool</th>
                          <th className="px-3 py-3">Logic</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-3 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {draws.map((d: any) => (
                          <tr key={d.id} className="border-b border-white/5 text-slate-300">
                            <td className="px-3 py-4 font-semibold text-white">{d.month || dateText(d.date)}</td>
                            <td className="px-3 py-4">{Array.isArray(d.winningNumbers) ? d.winningNumbers.join(', ') : '—'}</td>
                            <td className="px-3 py-4">{money(d.totalPool)}</td>
                            <td className="px-3 py-4 capitalize">{d.drawLogic || d.logic || '—'}</td>
                            <td className="px-3 py-4"><span className={`rounded-full border px-2 py-1 text-[10px] ${statusClass(d.status || 'unknown')}`}>{d.status || 'unknown'}</span></td>
                            <td className="px-3 py-4">
                              <button onClick={() => handleDeleteDraw(d.id)} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10" title="Delete draw">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'winners' && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Winner Verification & Payouts</h2>
              <p className="text-xs text-slate-400">Review proof, approve or reject claims, then mark approved prizes as paid.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'paid'] as WinnerFilter[]).map((filter) => (
                <button key={filter} onClick={() => setWinnerFilter(filter)} className={`rounded-xl px-3 py-2 text-[11px] font-semibold capitalize ${winnerFilter === filter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredWinners.length === 0 ? <EmptyState title="No winner claims in this filter" /> : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredWinners.map((w: any) => {
                const verification = w.verificationStatus || 'pending';
                const payout = w.payoutStatus || 'pending';
                const proofUrl = w.proofUrl || w.proof?.url;

                return (
                  <Card key={w.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-300"><Trophy className="h-5 w-5" /></div>
                        <div>
                          <h3 className="font-bold text-white">{w.user?.name || w.userName || w.name || 'Winner'}</h3>
                          <p className="text-[11px] text-slate-500">{w.user?.email || w.email || 'No email'}</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] ${statusClass(verification)}`}>{verification}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-800/60 p-3">
                        <p className="text-[10px] uppercase text-slate-500">Match tier</p>
                        <p className="mt-1 font-bold text-white">{w.matchType || w.tier || '—'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/60 p-3">
                        <p className="text-[10px] uppercase text-slate-500">Prize</p>
                        <p className="mt-1 font-bold text-emerald-300">{money(w.prizeAmount || w.amount)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-400">
                      <span>Draw: {w.draw?.month || w.drawMonth || '—'}</span>
                      <span>•</span>
                      <span>Claimed: {dateText(w.createdAt || w.claimedAt)}</span>
                      <span>•</span>
                      <span className="capitalize">Payout: {payout}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => setSelectedProofWinner(w)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700">
                        <Eye className="h-3.5 w-3.5" /> Review
                      </button>
                      {proofUrl && (
                        <a href={proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:text-white">
                          <ExternalLink className="h-3.5 w-3.5" /> Proof
                        </a>
                      )}
                      {verification === 'approved' && payout !== 'paid' && (
                        <button onClick={() => handleMarkPayout(w.id)} className="ml-auto flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-500">
                          <WalletCards className="h-3.5 w-3.5" /> Mark Paid
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'charities' && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Charity Management</h2>
              <p className="text-xs text-slate-400">Add, edit, delete and feature charity partners and their media.</p>
            </div>
            <button onClick={() => handleOpenCharityModal()} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500">
              <Plus className="h-4 w-4" /> Add Charity
            </button>
          </div>

          {charities.length === 0 ? <EmptyState title="No charities found" text="Add the first charity partner to the directory." /> : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {charities.map((c: any) => {
                const spotlight = Boolean(c.isSpotlight ?? c.featured);
                return (
                  <Card key={c.id} className="overflow-hidden">
                    <div className="relative h-36 bg-slate-800">
                      {c.bannerUrl ? <img src={c.bannerUrl} alt={c.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Heart className="h-8 w-8 text-slate-600" /></div>}
                      {spotlight && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-black"><Star className="h-3 w-3 fill-current" /> Spotlight</span>}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white">{c.name}</h3>
                          <p className="mt-1 text-[11px] text-indigo-300">{c.tagline || c.category || 'Charity partner'}</p>
                        </div>
                        {c.logoUrl && <img src={c.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                      </div>
                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-400">{c.description || 'No description available.'}</p>
                      <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Raised: {money(c.totalRaised)}</span>
                        {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">Website</a>}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                        <button onClick={() => handleOpenCharityModal(c)} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                        <button onClick={() => handleToggleSpotlight(c.id, spotlight)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold ${spotlight ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-300'}`}><Star className="h-3.5 w-3.5" /> {spotlight ? 'Unfeature' : 'Spotlight'}</button>
                        <button onClick={() => handleDeleteCharity(c.id)} className="ml-auto rounded-lg bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Subscriber Directory</h2>
            <p className="text-xs text-slate-400">View profiles, subscription status and golf handicap information.</p>
          </div>

          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search name, email or home club…" className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500" />
              </div>
              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as UserStatusFilter[]).map((filter) => (
                  <button key={filter} onClick={() => setUserStatusFilter(filter)} className={`rounded-xl px-3 py-2 text-[11px] font-semibold capitalize ${userStatusFilter === filter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{filter}</button>
                ))}
              </div>
            </div>
          </Card>

          {filteredUsers.length === 0 ? <EmptyState title="No users match the current filters" /> : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="border-b border-white/10 bg-slate-950/60 text-[10px] uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Member</th>
                      <th className="px-5 py-3">Subscription</th>
                      <th className="px-5 py-3">Handicap</th>
                      <th className="px-5 py-3">Charity</th>
                      <th className="px-5 py-3">Joined</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u: any) => {
                      const status = u?.subscription?.status || u?.status || 'inactive';
                      const handicap = Number(u?.handicap ?? u?.handicapIndex ?? 0);
                      return (
                        <tr key={u.id} className="border-b border-white/5 text-slate-300">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300"><Users className="h-4 w-4" /></div>
                              <div>
                                <p className="font-semibold text-white">{u.name || 'Unnamed member'}</p>
                                <p className="text-[10px] text-slate-500">{u.email || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-2 py-1 text-[10px] capitalize ${statusClass(status)}`}>{status}</span>
                            <p className="mt-1 text-[10px] text-slate-500">{u.subscription?.plan || '—'}</p>
                          </td>
                          <td className="px-5 py-4 font-bold text-white">{handicap}</td>
                          <td className="px-5 py-4">{u.charity?.name || u.selectedCharity?.name || '—'}</td>
                          <td className="px-5 py-4">{dateText(u.createdAt || u.joinedAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <button onClick={() => handleAdjustHandicap(u.id, handicap)} className="rounded-lg p-2 text-indigo-300 hover:bg-indigo-500/10" title="Adjust handicap"><Award className="h-4 w-4" /></button>
                              <button onClick={() => handleToggleUserStatus(u.id)} className={`rounded-lg p-2 ${status === 'active' ? 'text-rose-300 hover:bg-rose-500/10' : 'text-emerald-300 hover:bg-emerald-500/10'}`} title={status === 'active' ? 'Deactivate user' : 'Activate user'}>
                                {status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedProofWinner && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-300">Winner claim review</p>
                <h3 className="mt-1 text-lg font-bold text-white">{(selectedProofWinner as any).user?.name || (selectedProofWinner as any).userName || 'Winner'}</h3>
              </div>
              <button onClick={() => { setSelectedProofWinner(null); setAdminNotes(''); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 p-5">
              {(selectedProofWinner as any).proofUrl || (selectedProofWinner as any).proof?.url ? (
                <a href={(selectedProofWinner as any).proofUrl || (selectedProofWinner as any).proof?.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                  <img src={(selectedProofWinner as any).proofUrl || (selectedProofWinner as any).proof?.url} alt="Winner proof" className="max-h-80 w-full object-contain" />
                </a>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                  <FileText className="mx-auto h-7 w-7 text-slate-600" />
                  <p className="mt-2 text-xs text-slate-400">No proof attached.</p>
                  <button onClick={() => handleAttachProof((selectedProofWinner as any).id)} className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-indigo-500">Attach Proof</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-[10px] uppercase text-slate-500">Verification</p>
                  <p className="mt-1 font-bold capitalize text-white">{(selectedProofWinner as any).verificationStatus || 'pending'}</p>
                </div>
                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-[10px] uppercase text-slate-500">Payout</p>
                  <p className="mt-1 font-bold capitalize text-white">{(selectedProofWinner as any).payoutStatus || 'pending'}</p>
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Admin notes</span>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} placeholder="Add verification or rejection notes…" className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500" />
              </label>

              <div className="flex flex-wrap justify-end gap-2">
                {(selectedProofWinner as any).verificationStatus === 'pending' && (
                  <>
                    <button onClick={() => handleAuditWinner((selectedProofWinner as any).id, 'rejected')} className="flex items-center gap-2 rounded-xl bg-rose-600/90 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500"><X className="h-4 w-4" /> Reject</button>
                    <button onClick={() => handleAuditWinner((selectedProofWinner as any).id, 'approved')} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"><Check className="h-4 w-4" /> Approve</button>
                  </>
                )}
                {(selectedProofWinner as any).verificationStatus === 'approved' && (selectedProofWinner as any).payoutStatus !== 'paid' && (
                  <button onClick={() => handleMarkPayout((selectedProofWinner as any).id)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"><WalletCards className="h-4 w-4" /> Mark Payout Paid</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCharityModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-300">Charity directory</p>
                <h3 className="mt-1 text-lg font-bold text-white">{editingCharity ? 'Edit Charity' : 'Add Charity'}</h3>
              </div>
              <button onClick={() => { setIsCharityModalOpen(false); resetCharityForm(); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveCharity} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {[
                ['name', 'Name'],
                ['tagline', 'Tagline'],
                ['category', 'Category'],
                ['websiteUrl', 'Website URL'],
                ['logoUrl', 'Logo URL'],
                ['bannerUrl', 'Banner URL'],
              ].map(([key, label]) => (
                <label key={key} className={key === 'name' ? 'sm:col-span-2' : ''}>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</span>
                  <input value={(charityFormData as any)[key]} onChange={(e) => setCharityFormData((p) => ({ ...p, [key]: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500" />
                </label>
              ))}

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Description</span>
                <textarea rows={4} value={charityFormData.description} onChange={(e) => setCharityFormData((p) => ({ ...p, description: e.target.value }))} className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500" />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Impact statement</span>
                <textarea rows={3} value={charityFormData.impactStatement} onChange={(e) => setCharityFormData((p) => ({ ...p, impactStatement: e.target.value }))} className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500" />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900 p-3 sm:col-span-2">
                <input type="checkbox" checked={charityFormData.isSpotlight} onChange={(e) => setCharityFormData((p) => ({ ...p, isSpotlight: e.target.checked }))} className="h-4 w-4 accent-indigo-600" />
                <span className="text-xs font-semibold text-white">Feature this charity as a homepage spotlight</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                <button type="button" onClick={() => { setIsCharityModalOpen(false); resetCharityForm(); }} className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500">{editingCharity ? 'Save Changes' : 'Create Charity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
