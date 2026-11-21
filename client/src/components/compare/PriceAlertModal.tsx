import React, { useState } from 'react';
import { X, Bell, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { compareService } from '../../services/compare.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupKey: string;
  productName: string;
  currentLowestPrice: number | null;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  groupKey,
  productName,
  currentLowestPrice,
}) => {
  const { user } = useAuth();
  const currentPrice = currentLowestPrice || 100000;
  const defaultTarget = Math.round(currentPrice * 0.95); // 5% drop by default

  const [targetPrice, setTargetPrice] = useState<number>(defaultTarget);
  const [email, setEmail] = useState<string>(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || targetPrice >= currentPrice) {
      toast.error('Target price must be lower than the current lowest price');
      return;
    }

    setLoading(true);
    try {
      const res = await compareService.createPriceAlert({
        groupKey,
        productName,
        targetPrice,
        currentPrice,
      });

      if (res.success) {
        setSuccess(true);
        toast.success('Price alert active! You will be notified the instant the price drops.');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      } else {
        toast.error(res.error || 'Failed to set price alert');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save alert. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  const discountPercent = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f0e0d] text-[#f5f4ef] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#161514]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-syne text-white">Create Price Drop Alert</h3>
              <p className="text-[11px] font-mono text-zinc-400">Get notified when any retailer drops price</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-syne text-white">Price Alert Active!</h4>
              <p className="text-xs font-mono text-zinc-400 max-w-xs">
                We're actively monitoring Amazon, Flipkart, Croma, and Reliance Digital. You'll get an alert at{' '}
                <span className="text-zinc-200">{email}</span> when it hits ₹{targetPrice.toLocaleString('en-IN')}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Selected Product</div>
                <div className="text-sm font-semibold font-syne text-white truncate">{productName}</div>
                <div className="text-xs font-mono text-zinc-300">
                  Current Lowest: <span className="text-emerald-400 font-bold">₹{currentPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Target Price Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Target Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-24 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Enter target price"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-blue-400">
                    {discountPercent > 0 ? `-${discountPercent}%` : ''}
                  </span>
                </div>

                {/* Quick Target Chips */}
                <div className="flex gap-2 pt-1">
                  {[5, 10, 15].map((pct) => {
                    const price = Math.round(currentPrice * (1 - pct / 100));
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTargetPrice(price)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono border transition-colors ${
                          targetPrice === price
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        -{pct}% (₹{price.toLocaleString('en-IN')})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Notification Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Activate Target Price Alert</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Zero spam guarantee. Alert sent only once upon price target match.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
