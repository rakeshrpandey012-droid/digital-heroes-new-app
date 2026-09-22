import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Smartphone, 
  Building2, 
  Lock,
  Sparkles
} from 'lucide-react';
import { PaymentMethodInfo } from '../types.ts';

interface PaymentMethodSelectorProps {
  value?: PaymentMethodInfo;
  onChange: (method: PaymentMethodInfo) => void;
  compact?: boolean;
  actionButtonText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
  compact = false,
  actionButtonText,
  onConfirm,
  isLoading = false
}) => {
  const [methodType, setMethodType] = useState<PaymentMethodInfo['type']>(value?.type || 'card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardholderName, setCardholderName] = useState(value?.cardholderName || 'Marcus Vance');
  const [expMonth, setExpMonth] = useState(value?.expMonth || '12');
  const [expYear, setExpYear] = useState(value?.expYear || '28');
  const [cvc, setCvc] = useState('888');
  const [zip, setZip] = useState('92037');
  const [paypalEmail, setPaypalEmail] = useState(value?.paypalEmail || 'subscriber@example.com');
  const [bankRouting, setBankRouting] = useState('121000358');
  const [bankAccount, setBankAccount] = useState('•••• 9942');

  // Detect card brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'Amex';
    return 'Visa';
  };

  const currentBrand = getCardBrand(cardNumber);

  // Sync back to parent when inputs change
  useEffect(() => {
    let updated: PaymentMethodInfo;

    if (methodType === 'card') {
      const clean = cardNumber.replace(/\D/g, '');
      const last4 = clean.length >= 4 ? clean.slice(-4) : '4242';
      updated = {
        type: 'card',
        brand: currentBrand,
        last4,
        expMonth,
        expYear,
        cardholderName,
        isDefault: true
      };
    } else if (methodType === 'apple_pay') {
      updated = {
        type: 'apple_pay',
        brand: 'Apple Pay',
        last4: '8831',
        cardholderName: cardholderName || 'Apple Pay User',
        isDefault: true
      };
    } else if (methodType === 'google_pay') {
      updated = {
        type: 'google_pay',
        brand: 'Google Pay',
        last4: '1094',
        cardholderName: cardholderName || 'Google Pay User',
        isDefault: true
      };
    } else if (methodType === 'paypal') {
      updated = {
        type: 'paypal',
        brand: 'PayPal',
        paypalEmail,
        isDefault: true
      };
    } else {
      updated = {
        type: 'bank_transfer',
        brand: 'Direct ACH',
        bankName: 'JPMorgan Chase Bank',
        last4: '9942',
        isDefault: true
      };
    }

    onChange(updated);
  }, [methodType, cardNumber, cardholderName, expMonth, expYear, paypalEmail, bankRouting, bankAccount]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    // Format in blocks of 4
    let formatted = '';
    for (let i = 0; i < v.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += v[i];
    }
    setCardNumber(formatted || '4242 •••• •••• 4242');
  };

  return (
    <div className="space-y-4">
      {/* Method Type Pills */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          {/* Credit Card */}
          <button
            type="button"
            onClick={() => setMethodType('card')}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
              methodType === 'card'
                ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                : 'border-white/10 bg-slate-900/80 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0 text-amber-400" />
            <div className="truncate">
              <div className="text-xs font-medium leading-none">Credit Card</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Visa / MC / Amex</div>
            </div>
          </button>

          {/* Apple Pay */}
          <button
            type="button"
            onClick={() => setMethodType('apple_pay')}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
              methodType === 'apple_pay'
                ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                : 'border-white/10 bg-slate-900/80 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span className="text-sm font-bold leading-none"></span>
            <div className="truncate">
              <div className="text-xs font-medium leading-none">Apple Pay</div>
              <div className="text-[10px] text-slate-400 mt-0.5">1-Tap Touch ID</div>
            </div>
          </button>

          {/* Google Pay */}
          <button
            type="button"
            onClick={() => setMethodType('google_pay')}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
              methodType === 'google_pay'
                ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                : 'border-white/10 bg-slate-900/80 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span className="text-xs font-bold text-cyan-400 leading-none">GPay</span>
            <div className="truncate">
              <div className="text-xs font-medium leading-none">Google Pay</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Instant Auth</div>
            </div>
          </button>

          {/* PayPal */}
          <button
            type="button"
            onClick={() => setMethodType('paypal')}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
              methodType === 'paypal'
                ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                : 'border-white/10 bg-slate-900/80 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span className="text-xs font-bold text-blue-400 leading-none">P</span>
            <div className="truncate">
              <div className="text-xs font-medium leading-none">PayPal</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Buyer Protect</div>
            </div>
          </button>

        </div>
      </div>

      {/* Card Details Form */}
      {methodType === 'card' && (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-white/10 animate-in fade-in duration-150">
          
          {/* Card Preview Visual */}
          {!compact && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#131b2c] to-slate-900 border border-amber-500/30 text-white shadow-inner flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4.5 rounded bg-amber-400/80"></div>
                  <span className="text-[10px] tracking-widest text-slate-400 font-mono">DIGITAL HEROES</span>
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono uppercase">{currentBrand}</span>
              </div>
              <div className="font-mono text-sm tracking-wider text-slate-200">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[150px] uppercase">{cardholderName || 'CARDHOLDER'}</span>
                <span>EXP: {expMonth}/{expYear}</span>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className="w-full pl-3 pr-16 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase">
                  {currentBrand}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Marcus Vance"
                  value={cardholderName}
                  onChange={e => setCardholderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Billing ZIP
                </label>
                <input
                  type="text"
                  placeholder="92037"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  maxLength={5}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Exp Month
                </label>
                <input
                  type="text"
                  placeholder="MM"
                  value={expMonth}
                  onChange={e => setExpMonth(e.target.value.substring(0, 2))}
                  maxLength={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs font-mono text-center text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Exp Year
                </label>
                <input
                  type="text"
                  placeholder="YY"
                  value={expYear}
                  onChange={e => setExpYear(e.target.value.substring(0, 2))}
                  maxLength={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs font-mono text-center text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  CVC / CVV
                </label>
                <input
                  type="password"
                  placeholder="888"
                  value={cvc}
                  onChange={e => setCvc(e.target.value.substring(0, 4))}
                  maxLength={4}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs font-mono text-center text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apple Pay Form */}
      {methodType === 'apple_pay' && (
        <div className="p-4 rounded-xl bg-black border border-white/20 text-center space-y-3 animate-in fade-in duration-150">
          <div className="w-10 h-10 rounded-full bg-white/10 mx-auto flex items-center justify-center text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Apple Pay Ready</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Apple Cash & connected cards ending in <span className="font-mono text-white font-bold">8831</span> verified on your device.
            </p>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Biometric confirmation will trigger when you submit</span>
          </div>
        </div>
      )}

      {/* Google Pay Form */}
      {methodType === 'google_pay' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-white/20 text-center space-y-3 animate-in fade-in duration-150">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 font-bold text-sm">
            GPay
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Google Pay Integrated</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Linked to your Google account payment profile ending in <span className="font-mono text-white font-bold">1094</span>.
            </p>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Encrypted zero-knowledge payment token tokenized via Google Wallet</span>
          </div>
        </div>
      )}

      {/* PayPal Form */}
      {methodType === 'paypal' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-white/20 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-blue-400">PayPal</span>
            <span className="text-[10px] text-slate-400">Express Checkout Account</span>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              PayPal Account Email
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              placeholder="subscriber@example.com"
              className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Eligible for PayPal Buyer Protection on sports subscriptions</span>
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Encrypted & PCI-DSS Compliant</span>
        </div>
        <span className="text-slate-500">Stripe & Tokenized Vault</span>
      </div>

      {/* Optional action button */}
      {onConfirm && actionButtonText && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{actionButtonText}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
