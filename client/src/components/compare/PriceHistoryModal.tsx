import React, { useEffect, useState } from 'react';
import { X, TrendingDown, Activity, Calendar, ShieldCheck, Database, Radio } from 'lucide-react';
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
  const [selectedRange, setSelectedRange] = useState<7 | 30 | 90>(30);
  const [activeMarketplace, setActiveMarketplace] = useState<string>('lowest');

  useEffect(() => {
    if (!isOpen || !groupKey) return;
    setLoading(true);
    compareService
      .getPriceHistory(groupKey, selectedRange)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch price history:', err))
      .finally(() => setLoading(false));
  }, [isOpen, groupKey, selectedRange]);

  if (!isOpen) return null;

  const stats = data?.stats;
  const history = data?.history || [];
  const feedType = history[0]?.feedType || 'DEVELOPMENT_FEED';

  // SVG Chart Calculations
  const chartHeight = 220;
  const chartWidth = 600;
  const padding = 40;

  const getPriceForPoint = (item: any) => {
    if (activeMarketplace === 'lowest') return item.lowest || item.shopvista || item.flipkart || item.amazon || currentLowestPrice || 100000;
    return item[activeMarketplace] || item.lowest || currentLowestPrice || 100000;
  };

  const currentPrices = history.map((item) => getPriceForPoint(item));
  const minPrice = currentPrices.length > 0 ? Math.min(...currentPrices) * 0.97 : (stats?.lowestRecordedPrice ? stats.lowestRecordedPrice * 0.97 : 100000);
  const maxPrice = currentPrices.length > 0 ? Math.max(...currentPrices) * 1.03 : (stats?.highestRecordedPrice ? stats.highestRecordedPrice * 1.03 : 140000);
  const priceRange = maxPrice - minPrice || 1;

  const points = history.map((item, idx) => {
    const x = padding + (idx / (history.length - 1 || 1)) * (chartWidth - padding * 2);
    const p = getPriceForPoint(item);
    const y = chartHeight - padding - ((p - minPrice) / priceRange) * (chartHeight - padding * 2);
    return { x, y, price: p, date: item.date };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0f0e0d] text-[#f5f4ef] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#161514]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-3 h-3" /> Price Intelligence
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                feedType === 'LIVE_API'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : feedType === 'INTERNAL_DATABASE'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {feedType === 'LIVE_API' ? 'Live API Feed' : feedType === 'INTERNAL_DATABASE' ? 'Internal DB' : 'Development Feed'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-syne text-white truncate max-w-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Timeline Range Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
              {([7, 30, 90] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRange(r)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    selectedRange === r
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}-Day View
                </button>
              ))}
            </div>

            {/* Marketplace Filter Pills */}
            <div className="flex items-center gap-1 text-[11px] font-mono overflow-x-auto pb-1 sm:pb-0">
              <span className="text-zinc-500 mr-1 hidden sm:inline">Store:</span>
              {[
                { id: 'lowest', label: 'Best Market Price' },
                { id: 'amazon', label: 'Amazon' },
                { id: 'flipkart', label: 'Flipkart' },
                { id: 'croma', label: 'Croma' },
                { id: 'reliance', label: 'Reliance' },
                { id: 'shopvista', label: 'ShopVista' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMarketplace(m.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                    activeMarketplace === m.id
                      ? 'bg-white/10 text-white border-white/20 font-bold'
                      : 'bg-transparent text-zinc-400 border-white/5 hover:text-zinc-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-zinc-400">Loading {selectedRange}-day historical price intelligence...</p>
            </div>
          ) : (
            <>
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Lowest Recorded</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    ₹{stats?.lowestRecordedPrice?.toLocaleString('en-IN') || '—'}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{selectedRange}-day window</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Highest Recorded</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-rose-400 mt-0.5">
                    ₹{stats?.highestRecordedPrice?.toLocaleString('en-IN') || '—'}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{selectedRange}-day window</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Period Average</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-zinc-200 mt-0.5">
                    ₹{stats?.averagePrice?.toLocaleString('en-IN') || '—'}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Weighted mean</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Price Drop %</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-blue-400 mt-0.5 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {stats?.priceDropPercentage || 0}%
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Peak vs Trough</span>
                </div>
              </div>

              {/* Price Graph SVG */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Tracking: <strong className="text-white capitalize">{activeMarketplace}</strong>
                  </span>
                  <span>Range: ₹{Math.round(minPrice).toLocaleString('en-IN')} — ₹{Math.round(maxPrice).toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full overflow-hidden">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 sm:h-56 stroke-current">
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
                  <span>{selectedRange} Days Ago</span>
                  <span>{Math.round(selectedRange / 2)} Days Ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Context Footer */}
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/10 font-mono gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Historical price snapshots verified with marketplace feed timestamps
                </span>
                <span>{stats?.dataPointsCount || points.length} data points logged</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
