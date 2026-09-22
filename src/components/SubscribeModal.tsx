import React, { useState } from 'react';
import { X, Check, ShieldCheck, Sparkles, CreditCard, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { PaymentMethodInfo } from '../types.ts';
import { PaymentMethodSelector } from './PaymentMethodSelector.tsx';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const { user, updateSubscription, toggleSubscription } = useAuth();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInfo>(
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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setStep('processing');
    setLoading(true);

    try {
      // Simulate real PCI-compliant Stripe checkout latency
      await new Promise(r => setTimeout(r, 1000));
      await updateSubscription(plan, paymentMethod);
      setStep('success');
    } catch {
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleState = async () => {
    setLoading(true);
    await toggleSubscription();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 border border-white/15 card-glow-amber">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'success' ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Subscription Active!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your {plan} subscription has been confirmed via our simulated PCI-compliant checkout. You are now fully eligible to log Stableford scores, participate in monthly draws, and direct funds to your chosen charity.
            </p>
            <button
              onClick={() => { setStep('select'); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs"
            >
              Enter Dashboard
            </button>
          </div>
        ) : step === 'processing' ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="font-display text-base font-bold text-white">Connecting Payment Gateway...</h4>
            <p className="text-xs text-slate-400">Securing tokenized payment session (Stripe API)</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Choose Your Subscription
              </h3>
              <p className="text-xs text-slate-400">
                PRD §04: Monthly and discounted yearly tiers
              </p>
            </div>

            {/* Current status banner if user already subscribed */}
            {user && (
              <div className="mb-5 p-3 bg-slate-900 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Current Status: </span>
                  <span className={`font-semibold capitalize ${user.subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {user.subscription.status}
                  </span>
                  <span className="text-slate-400"> ({user.subscription.plan})</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleState}
                  disabled={loading}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg transition-colors"
                >
                  {user.subscription.status === 'active' ? 'Simulate Lapsed / Cancel' : 'Reactivate'}
                </button>
              </div>
            )}

            {/* Plan selector cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Monthly */}
              <div
                onClick={() => setPlan('monthly')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  plan === 'monthly'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-300">Monthly Tier</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    plan === 'monthly' ? 'border-amber-400 bg-amber-400' : 'border-white/20'
                  }`}>
                    {plan === 'monthly' && <Check className="w-3 h-3 text-black" />}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white font-display mb-1">$29<span className="text-xs text-slate-400 font-normal"> / mo</span></div>
                <p className="text-[11px] text-slate-400 leading-snug">Full monthly draw entry & score tracking.</p>
              </div>

              {/* Yearly */}
              <div
                onClick={() => setPlan('yearly')}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                  plan === 'yearly'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                }`}
              >
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black text-[9px] font-bold uppercase tracking-wider">
                  2 Months Free
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-300">Yearly Tier</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    plan === 'yearly' ? 'border-amber-400 bg-amber-400' : 'border-white/20'
                  }`}>
                    {plan === 'yearly' && <Check className="w-3 h-3 text-black" />}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white font-display mb-1">$290<span className="text-xs text-slate-400 font-normal"> / yr</span></div>
                <p className="text-[11px] text-slate-400 leading-snug">Best value: 12 monthly draws for price of 10.</p>
              </div>
            </div>

            {/* Key Benefits Checklist */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/10 mb-6 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Automatic entry into monthly 5, 4, and 3-number prize draws</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Rolling 5-score Stableford handicap management</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>At least 10% guaranteed allocation to your designated charity</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Rollover 5-match jackpot protection if unclaimed</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
                compact={true}
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Confirm {plan === 'yearly' ? '$290 / Year' : '$29 / Month'} Subscription</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Stripe PCI-DSS Level 1 Encrypted Checkout</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
