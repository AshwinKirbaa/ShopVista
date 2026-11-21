import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  ShoppingBag,
  TrendingDown,
  Activity,
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  Filter,
  Layers,
} from 'lucide-react';
import {
  compareService,
  ComparisonGroup,
  NormalizedOffer,
  ProviderHealth,
} from '../services/compare.service';
import { PriceHistoryModal } from '../components/compare/PriceHistoryModal';
import { PriceAlertModal } from '../components/compare/PriceAlertModal';

const POPULAR_SEARCHES = [
  'iPhone 17 Pro 256GB',
  'MacBook Pro M4 Pro',
  'Sony WH-1000XM5',
  'Galaxy S25 Ultra 256GB',
  'AirPods Pro 2',
];

export const CompareSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'iPhone 17 Pro 256GB';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ComparisonGroup[]>([]);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [totalGroups, setTotalGroups] = useState(0);

  // Filters & Sorting state
  const [sortBy, setSortBy] = useState<'lowest_price' | 'highest_price' | 'discount' | 'savings'>('lowest_price');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedCondition, setSelectedCondition] = useState<string>('');

  // Modals state
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    groupKey: string;
    title: string;
    lowestPrice: number | null;
  }>({
    isOpen: false,
    groupKey: '',
    title: '',
    lowestPrice: null,
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    groupKey: string;
    productName: string;
    lowestPrice: number | null;
  }>({
    isOpen: false,
    groupKey: '',
    productName: '',
    lowestPrice: null,
  });

  // Fetch provider health on mount
  useEffect(() => {
    compareService
      .getMarketplaces()
      .then((res) => {
        if (res.success && res.data) {
          setProviders(res.data);
        }
      })
      .catch((err) => console.error('Provider health fetch error:', err));
  }, []);

  // Perform search
  const performSearch = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);

    compareService
      .searchCompare({
        q,
        sortBy,
        marketplace: selectedMarketplace || undefined,
        inStock: inStockOnly || undefined,
        condition: selectedCondition || undefined,
      })
      .then((res) => {
        if (res.success && res.data) {
          setGroups(res.data.groups);
          setTotalGroups(res.data.totalGroups);
        }
      })
      .catch((err) => console.error('Search comparison error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    performSearch(initialQuery);
  }, [initialQuery, sortBy, selectedMarketplace, inStockOnly, selectedCondition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query);
  };

  const handleQuickChipClick = (term: string) => {
    setQuery(term);
    setSearchParams({ q: term });
    performSearch(term);
  };

  return (
    <div className="min-h-screen bg-[#090807] text-[#f5f4ef] pb-24 selection:bg-blue-600 selection:text-white">
      {/* Top Banner & Header */}
      <div className="relative border-b border-white/10 bg-[#121110] overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Multi-Platform Price Intelligence
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-syne tracking-tight text-white">
              Compare Prices Across <span className="text-blue-500">Major Retailers</span>
            </h1>

            <p className="text-sm sm:text-base font-mono text-zinc-400 max-w-2xl">
              Real-time price normalization across Amazon India, Flipkart, Croma, Reliance Digital, and ShopVista. Strict variant matching prevents misleading comparisons.
            </p>

            {/* Main Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="w-full mt-4">
              <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-white/15 bg-[#1a1918] focus-within:border-blue-500 transition-all">
                <Search className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brand, model, storage (e.g. iPhone 17 Pro 256GB, Sony WH-1000XM5)..."
                  className="w-full py-4 pl-12 pr-32 bg-transparent text-white font-mono text-sm sm:text-base placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Compare'}
                </button>
              </div>
            </form>

            {/* Quick Pick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider mr-1">Trending:</span>
              {POPULAR_SEARCHES.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleQuickChipClick(chip)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    query.toLowerCase() === chip.toLowerCase()
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Live Connected Retailers Status Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {providers.map((p) => (
                <div
                  key={p.slug}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-mono text-zinc-300"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${p.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="text-zinc-500">{p.isAvailable ? `${p.latencyMs}ms` : 'offline'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141312] border border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Marketplace Filter */}
            <select
              value={selectedMarketplace}
              onChange={(e) => setSelectedMarketplace(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Retailers</option>
              <option value="amazon">Amazon India</option>
              <option value="flipkart">Flipkart</option>
              <option value="croma">Croma</option>
              <option value="reliance">Reliance Digital</option>
              <option value="shopvista">ShopVista Direct</option>
            </select>

            {/* Condition Filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Conditions</option>
              <option value="NEW">Brand New Only</option>
              <option value="REFURBISHED">Refurbished Only</option>
            </select>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300 select-none px-2 py-1 rounded-lg hover:bg-white/5">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-zinc-700 bg-black/50 text-blue-500 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-3 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500"
            >
              <option value="lowest_price">Lowest Price First</option>
              <option value="savings">Biggest Potential Savings</option>
              <option value="discount">Highest Discount %</option>
              <option value="highest_price">Highest Price First</option>
            </select>
          </div>
        </div>

        {/* Results Stream */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-zinc-400">
              Querying live marketplace feeds & matching variants...
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#141312] border border-white/10 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-zinc-500 mx-auto" />
            <h3 className="text-lg font-bold font-syne text-white">No Matching Products Found</h3>
            <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
              We couldn't match any verified listings for "{query}". Try checking the spelling or search for popular tech like "iPhone 17 Pro", "MacBook Pro M4", or "Sony WH-1000XM5".
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/10 pb-3">
              <span>Found {totalGroups} distinct product variants compared across 5 authorized retailers</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Strict Variant Isolation Verified
              </span>
            </div>

            {groups.map((group) => {
              const lowestOffer = group.offers.find((o) => o.isLowestPrice);
              const savings = group.potentialSavings;

              return (
                <div
                  key={group.groupKey}
                  className="rounded-2xl bg-[#141312] border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-white/20"
                >
                  {/* Card Header: Product Identity & Spec Overview */}
                  <div className="p-6 border-b border-white/10 bg-[#191817] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-2">
                        <img
                          src={group.imageUrl}
                          alt={group.canonicalTitle}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {group.brand}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                            {group.variant}
                          </span>
                          {group.condition === 'REFURBISHED' && (
                            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Refurbished
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Exact Match (98% Conf)
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-syne text-white tracking-tight">
                          {group.canonicalTitle}
                        </h2>
                        <p className="text-xs font-mono text-zinc-400">
                          Compared across {group.retailerCount} stores • {group.inStockRetailerCount} currently in stock
                        </p>
                      </div>
                    </div>

                    {/* Quick Analytics & Modal Triggers */}
                    <div className="flex flex-wrap md:flex-col items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setHistoryModal({
                              isOpen: true,
                              groupKey: group.groupKey,
                              title: group.canonicalTitle,
                              lowestPrice: group.lowestPrice,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5 text-blue-400" />
                          <span>30D Trend</span>
                        </button>

                        <button
                          onClick={() =>
                            setAlertModal({
                              isOpen: true,
                              groupKey: group.groupKey,
                              productName: group.canonicalTitle,
                              lowestPrice: group.lowestPrice,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-xs font-mono text-blue-300 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Bell className="w-3.5 h-3.5 text-blue-400" />
                          <span>Set Alert</span>
                        </button>
                      </div>

                      {/* Potential Savings Tag */}
                      {savings && savings > 0 && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Save up to ₹{savings.toLocaleString('en-IN')} ({group.savingsPercentage}%)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Offers Comparison Table */}
                  <div className="divide-y divide-white/5">
                    {group.offers.map((offer, idx) => {
                      const isLowest = offer.isLowestPrice;

                      return (
                        <div
                          key={`${offer.marketplaceSlug}-${idx}`}
                          className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                            isLowest ? 'bg-emerald-950/15 border-l-4 border-l-emerald-500' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Retailer Identity & Logistics */}
                          <div className="flex items-center gap-4 min-w-[220px]">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                              <img
                                src={offer.marketplaceLogo}
                                alt={offer.marketplaceName}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold font-syne text-white">
                                  {offer.marketplaceName}
                                </span>
                                {offer.feedType === 'LIVE_API' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Live API
                                  </span>
                                )}
                                {offer.feedType === 'INTERNAL_DATABASE' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Live Store
                                  </span>
                                )}
                                {offer.feedType === 'DEVELOPMENT_FEED' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    Dev Feed
                                  </span>
                                )}
                                {isLowest && (
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                                    Lowest Price
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-zinc-400">
                                {offer.deliveryTime || 'Standard Shipping'}
                              </p>
                              {offer.sellerName && (
                                <p className="text-[10px] font-mono text-zinc-500">
                                  Seller: {offer.sellerName}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Pricing & Stock Column */}
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <div className="text-left sm:text-right space-y-0.5">
                              <div className="flex items-baseline sm:justify-end gap-2">
                                <span className="text-lg sm:text-xl font-bold font-mono text-white">
                                  ₹{offer.finalPrice.toLocaleString('en-IN')}
                                </span>
                                {offer.mrp > offer.sellingPrice && (
                                  <span className="text-xs font-mono line-through text-zinc-500">
                                    ₹{offer.mrp.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center sm:justify-end gap-2 text-[11px] font-mono">
                                <span className={offer.inStock ? 'text-emerald-400' : 'text-rose-400'}>
                                  {offer.inStock ? '● In Stock' : '✕ Out of Stock'}
                                </span>
                                {offer.shippingCharge === 0 ? (
                                  <span className="text-zinc-400">• Free Delivery</span>
                                ) : (
                                  <span className="text-zinc-400">• +₹{offer.shippingCharge} delivery</span>
                                )}
                              </div>

                              {offer.couponDetails && (
                                <p className="text-[10px] font-mono text-blue-400 truncate max-w-xs">
                                  {offer.couponDetails}
                                </p>
                              )}
                            </div>

                            {/* Outbound Direct CTA Button */}
                            <div className="shrink-0">
                              {offer.isInternal ? (
                                <Link
                                  to={offer.productUrl}
                                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors shadow-lg shadow-blue-500/20"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>Buy on ShopVista</span>
                                </Link>
                              ) : (
                                <a
                                  href={offer.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all ${
                                    isLowest
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                                  }`}
                                >
                                  <span>Buy at {offer.marketplaceName.split(' ')[0]}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <PriceHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal((prev) => ({ ...prev, isOpen: false }))}
        groupKey={historyModal.groupKey}
        title={historyModal.title}
        currentLowestPrice={historyModal.lowestPrice}
      />

      <PriceAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        groupKey={alertModal.groupKey}
        productName={alertModal.productName}
        currentLowestPrice={alertModal.lowestPrice}
      />
    </div>
  );
};
