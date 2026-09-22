import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import { ShieldAlert, Lock, Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requiresActiveSubscription?: boolean;
  onOpenAuth?: () => void;
  onOpenSubscribe?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiresActiveSubscription = false,
  onOpenAuth,
  onOpenSubscribe
}) => {
  const { user, isLoading, demoLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono tracking-wider">VERIFYING CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-6 border border-amber-500/20 card-glow-amber">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-white">Authentication Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to access this area of the Digital Heroes platform, or use our 1-click reviewer demo accounts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all"
              >
                Sign In to Account
              </button>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-500 bg-[#0B0F17] px-2">
                Fast Evaluator Access
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => demoLogin('subscriber')}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Subscriber Demo
              </button>
              <button
                onClick={() => demoLogin('admin')}
                className="py-2 px-3 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-xs font-medium text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role validation
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-6 border border-rose-500/20">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-white">Privilege Level Restricted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account role (<span className="text-white font-mono">{user.role}</span>) does not hold the permissions required for this surface. Allowed roles: {allowedRoles.join(', ')}.
            </p>
          </div>

          {allowedRoles.includes('admin') && (
            <button
              onClick={() => demoLogin('admin')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Switch to Administrator Session
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active subscription check
  if (requiresActiveSubscription && user.role !== 'admin' && user.subscription.status !== 'active') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-6 border border-amber-500/30 card-glow-amber">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-white">Active Subscription Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To enter Stableford scores and enter monthly draws, your subscription must be active. (Current state: <span className="text-amber-400 font-semibold">{user.subscription.status}</span>).
            </p>
          </div>

          {onOpenSubscribe && (
            <button
              onClick={onOpenSubscribe}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
            >
              Activate / Renew Subscription
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
