import React, { useState } from 'react';
import { 
  Trophy, 
  Heart, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  Menu, 
  X,
  CreditCard,
  Target,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  openSubscribeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openSubscribeModal
}) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070A0F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  DIGITAL<span className="text-amber-400">HEROES</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  2026 PRD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">
                Performance · Rewards · Giving
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/5">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                currentTab === 'home'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Platform
            </button>

            <button
              onClick={() => setCurrentTab('charities')}
              className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 transition-all ${
                currentTab === 'charities'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-400" />
              Charities
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                User Dashboard
              </button>
            )}

            <button
              onClick={async () => {
                if (user?.role !== 'admin') {
                  await demoLogin('admin');
                }
                setCurrentTab('admin');
              }}
              className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-1.5 transition-all ${
                currentTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-semibold'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Console</span>
              {user?.role !== 'admin' && (
                <span className="px-1.5 py-0.5 bg-indigo-500/30 rounded text-[9px] uppercase font-bold text-indigo-200">
                  Admin
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Surface */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Dark / Light Theme Switcher */}
            <ThemeSwitcher />

            {/* Quick Demo Switcher Pills for Evaluator convenience */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-white/10 text-xs">
              <span className="px-2 text-slate-400 text-[11px] font-medium">Test As:</span>
              <button
                onClick={() => {
                  demoLogin('subscriber');
                  setCurrentTab('dashboard');
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  user?.email === 'subscriber@digitalheroes.com'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Log in as Marcus Vance (Subscriber)"
              >
                Subscriber
              </button>
              <button
                onClick={() => {
                  demoLogin('admin');
                  setCurrentTab('admin');
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  user?.role === 'admin'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Log in as Operations Admin (Full Control)"
              >
                Admin
              </button>
            </div>

            {/* Subscribe CTA or User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 bg-slate-900 border border-white/10 rounded-full hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-amber-400 font-medium capitalize">
                      {user.role} · {user.subscription.status}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-white/15"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] bg-white/5 px-2 py-1 rounded">
                        <span className="text-slate-300">Plan: {user.subscription.plan}</span>
                        <span className={`font-semibold ${user.subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {user.subscription.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-lg transition-colors text-left"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Scorecard & Winnings
                    </button>

                    <button
                      onClick={() => {
                        openSubscribeModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-lg transition-colors text-left"
                    >
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      Manage Subscription
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentTab('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-900/30 rounded-lg transition-colors text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    currentTab === 'login'
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Join the Draw
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0B0F17]/95 px-4 py-5 space-y-3">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                demoLogin('subscriber');
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs bg-amber-500 text-black font-semibold rounded-lg"
            >
              Subscriber Demo
            </button>
            <button
              onClick={() => {
                demoLogin('admin');
                setCurrentTab('admin');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs bg-indigo-600 text-white font-semibold rounded-lg"
            >
              Admin Demo
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 rounded-lg"
          >
            Platform Overview
          </button>
          <button
            onClick={() => {
              setCurrentTab('charities');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 rounded-lg"
          >
            Charity Directory
          </button>
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 rounded-lg"
          >
            User Dashboard
          </button>
          
          <button
            onClick={() => {
              if (user?.role !== 'admin') {
                demoLogin('admin');
              }
              setCurrentTab('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-900/20 rounded-lg flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Console</span>
            </span>
            {user?.role !== 'admin' && (
              <span className="px-1.5 py-0.5 bg-indigo-500/30 rounded text-[9px] uppercase font-bold text-indigo-200">
                Demo
              </span>
            )}
          </button>

          <div className="pt-2">
            <ThemeSwitcher showLabel={true} className="w-full justify-start px-3 py-2.5 rounded-lg text-sm" />
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-medium text-rose-400 bg-rose-500/10 rounded-lg"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setCurrentTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-medium text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                >
                  Sign In (Existing Member)
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-black bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg shadow-md shadow-amber-500/20"
                >
                  Join Digital Heroes (Register)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
