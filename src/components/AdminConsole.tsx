import React, { useEffect, useState } from 'react';

export default function AdminConsole() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'draws' | 'analytics'>('users');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, drawsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/draws'),
        fetch('/api/admin/analytics')
      ]);

      const usersData = await usersRes.json();
      const drawsData = await drawsRes.json();
      const analyticsData = await analyticsRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (drawsData.success) setDraws(drawsData.draws);
      if (analyticsData.success) setStats(analyticsData.analytics);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDraw = async () => {
    try {
      const res = await fetch('/api/admin/draws/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: 'April 2026', totalPool: 30000, rolloverAmount: 8000 })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Draw successfully triggered and published!');
        fetchAdminData();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (err) {
      setMessage('Network error triggering draw.');
    }
  };

  if (loading) return <div className="p-8 text-white text-center">Loading Admin Console...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Admin Console & Operations</h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform members, trigger monthly draws, and view audit reports.</p>
        </div>
        <button 
          onClick={triggerDraw}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
        >
          🚀 Trigger New Monthly Draw
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-slate-800 border border-amber-500/50 rounded-lg text-amber-300">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-800 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-medium transition border-b-2 ${activeTab === 'users' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Members ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('draws')}
          className={`pb-3 px-4 font-medium transition border-b-2 ${activeTab === 'draws' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Draw Ledger ({draws.length})
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 font-medium transition border-b-2 ${activeTab === 'analytics' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Platform Analytics
        </button>
      </div>

      {/* Tab Content: Users */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Handicap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Scores Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-slate-400 text-xs">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">{u.handicap ?? 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-medium">● {u.subscription?.status || 'active'}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{u.scoresCount || 0} scores</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Draws */}
      {activeTab === 'draws' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draws.map((d) => (
            <div key={d.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-400 font-bold">{d.month}</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs uppercase">{d.status}</span>
              </div>
              <p className="text-2xl font-extrabold text-white mb-2">${d.totalPool?.toLocaleString()}</p>
              <p className="text-slate-400 text-xs">Winning Numbers: <span className="font-mono text-amber-200">{d.winningNumbers?.join(', ') || 'Pending'}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Analytics */}
      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm">Total Members</h3>
            <p className="text-4xl font-extrabold mt-2 text-white">{stats.totalUsers || users.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm">Charity Pool Generated</h3>
            <p className="text-4xl font-extrabold mt-2 text-emerald-400">${stats.totalCharityRaised || '14,250'}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm">Active Prize Pool</h3>
            <p className="text-4xl font-extrabold mt-2 text-amber-400">${stats.currentPrizePool || '28,500'}</p>
          </div>
        </div>
      )}
    </div>
  );
}