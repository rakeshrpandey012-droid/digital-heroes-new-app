import React from 'react';
import { Target, Heart, Shield, Award, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="border-t border-white/10 bg-[#05070B] text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                DIGITAL<span className="text-amber-400">HEROES</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A high-performance subscription web platform combining golf score tracking, automated monthly draw prize pools, and charitable fundraising. Built with zero sport clichés.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Level 1 PRD 2026 · MongoDB Atlas Cluster0 (Live)
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Platform Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentTab('charities'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Charities Directory
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Subscriber Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Admin Control Surfaces
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: PRD Architecture Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Specifications (§01-§16)</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Stableford 1–45 score domain</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>5-Score rolling FIFO window</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>40% / 35% / 25% pool share logic</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Unclaimed jackpot rollover mechanism</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Role-Based Access (Public / Sub / Admin)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Integrity & Impact</h4>
            <div className="glass-panel p-3.5 rounded-xl space-y-2 border border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>10% Min Guaranteed Giving</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Every subscription actively directs verified contributions to causes chosen by our community.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>PCI-Compliant Payment Gateway Simulation</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Digital Heroes (digitalheroes.co.in). Built strictly to Product Requirements Document.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Participation</span>
            <span className="hover:text-slate-400 cursor-pointer">Fair Draw Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
