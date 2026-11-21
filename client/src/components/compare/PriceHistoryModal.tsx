import React, { useEffect, useState } from 'react';
import { X, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Calendar, ShieldCheck } from 'lucide-react';
import { compareService, PriceHistoryData } from '../../services/compare.service';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupKey: string;
  title: string;
  currentLowestPrice: number | null;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  groupKey,
  title,
  currentLowestPrice,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PriceHistoryData | null>(null);

  useEffect(() => {
    if (!isOpen || !groupKey) return;
    setLoading(true);
    compareService
      .getPriceHistory(groupKey)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch price history:', err))
      .finally(() => setLoading(false));
  }, [isOpen, groupKey]);

  if (!isOpen) return null;

  const stats = data?.stats;
  const history = data?.history || [];

  // SVG Chart Calculations
  const chartHeight = 220;
  const chartWidth = 600;
  const padding = 40;

  const minPrice = stats?.lowestRecordedPrice ? stats.lowestRecordedPrice * 0.96 : 100000;
  const maxPrice = stats?.highestRecordedPrice ? stats.highestRecordedPrice * 1.04 : 140000;
  const priceRange = maxPrice - minPrice || 1;

  const points = history.map((item, idx) => {
    const x = padding + (idx / (history.length - 1 || 1)) * (chartWidth - padding * 2);
    const p = item.flipkart || item.amazon || currentLowestPrice || 120000;
    const y = chartHeight - padding - ((p - minPrice) / priceRange) * (chartHeight - padding * 2);
    return { x, y, price: p, date: item.date };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f0e0d] text-[#f5f4ef] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161514]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-3 h-3" /> 30-Day Trend
              </span>
              <span className="text-xs font-mono text-zinc-400">Verified Retail Feeds</span>
            </div>
            <h3 className="text-lg font-bold font-syne text-white truncate max-w-md">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-zinc-400">Analyzing price history across 5 retailers...</p>
            </div>
          ) : (
            <>
              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Lowest Ever</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    ₹{stats?.lowestRecordedPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Highest Recorded</span>
                  <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                    ₹{stats?.highestRecordedPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">30D Average</span>
                  <div className="text-base font-bold font-mono text-zinc-200 mt-0.5">
                    ₹{stats?.averagePrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Price Drop %</span>
                  <div className="text-base font-bold font-mono text-blue-400 mt-0.5 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {stats?.priceDropPercentage}%
                  </div>
                </div>
              </div>

              {/* Price Graph SVG */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Market Price Movement
                  </span>
                  <span>Range: ₹{Math.round(minPrice).toLocaleString('en-IN')} — ₹{Math.round(maxPrice).toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full overflow-hidden">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 stroke-current">
                    {/* Horizontal Grid lines */}
                    <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#27272a" strokeDasharray="3 3" />
                    <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#27272a" strokeDasharray="3 3" />
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeDasharray="3 3" />

                    {/* Gradient Fill under path */}
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {points.length > 0 && (
                      <path
                        d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
                        fill="url(#priceGradient)"
                      />
                    )}

                    {/* Price Line */}
                    <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points */}
                    {points.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#60a5fa"
                        className="hover:r-5 transition-all cursor-pointer"
                      >
                        <title>{`${pt.date}: ₹${pt.price.toLocaleString('en-IN')}`}</title>
                      </circle>
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                  <span>30 Days Ago</span>
                  <span>15 Days Ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Context Footer */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/10 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Historical prices recorded from authorized retailer feeds
                </span>
                <span>{stats?.dataPointsCount} data points verified</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
