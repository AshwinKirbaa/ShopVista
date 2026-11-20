import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  MapPin,
  Check,
  Plus,
  Coffee,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { productService } from '../services/product.service';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { HeroCup } from '../components/coffee/HeroCup';
import { AnalogClock } from '../components/coffee/AnalogClock';
import { ThermalTicket } from '../components/coffee/ThermalTicket';
import toast from 'react-hot-toast';

export const Home: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await productService.getProducts({ limit: 8 });
        if (res.success && res.data) {
          setFavorites(res.data);
        }
      } catch (err) {
        console.error('Failed to load menu favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleQuickAdd = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to bag!`, {
        icon: '☕',
        style: {
          background: '#120a06',
          color: '#f5f4ef',
          fontFamily: 'Space Mono',
          fontSize: '12px',
        },
      });
    } catch {
      toast.error('Failed to add to bag');
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setNewsletterSubscribed(true);
      toast.success('Welcome to the Morning Ritual club.', {
        icon: '☕',
      });
    }
  };

  return (
    <div className="bg-[#f5f4ef] text-[#120a06] selection:bg-[#120a06] selection:text-[#f5f4ef]">
      {/* =========================================================================
          HERO SECTION (Deep Espresso Dark Canvas with 3D Cup & Bag)
          ========================================================================= */}
      <section className="relative bg-[#120a06] text-[#f5f4ef] overflow-hidden pt-8 pb-14 border-b border-[#2d1b11]">
        {/* Subtle radial ambient warmth */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#3a1d10]/40 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category Subheading */}
              <div className="inline-flex items-center gap-2 text-xs font-mono-code tracking-widest text-[#d4a373] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a373]" />
                <span>// SPECIALTY COFFEE HOUSE</span>
              </div>

              {/* Main Editorial Headline */}
              <div className="space-y-1">
                <h1 className="font-syne text-6xl sm:text-7xl md:text-8xl font-extrabold uppercase tracking-tight text-[#f5f4ef] leading-[0.9]">
                  COFFEE
                </h1>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#f5f4ef] leading-[0.9]">
                    FOR YOUR
                  </h2>
                  <span className="font-script text-5xl sm:text-7xl md:text-8xl text-[#e8c8a7] lowercase -rotate-3 select-none">
                    moment
                  </span>
                </div>
              </div>

              {/* Supporting Statement */}
              <p className="max-w-md text-xs sm:text-sm font-mono-code text-[#c4b9aa] uppercase tracking-wider leading-relaxed">
                CAREFULLY SOURCED BEANS AND THOUGHTFULLY BREWED TO BRING OUT THE BEST IN EVERY CUP.
              </p>

              {/* Primary CTA */}
              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#f5f4ef] text-[#120a06] text-xs font-mono-code font-bold uppercase tracking-wider hover:bg-[#e4dfd2] hover:scale-[1.02] transition-all shadow-lg"
                >
                  <span>Explore Menu</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#locations"
                  className="inline-flex items-center gap-2 text-xs font-mono-code text-[#d4a373] hover:underline uppercase tracking-wider px-3 py-2"
                >
                  <span>Find a Barista</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Center-Right Hero Cup Visual & Floating Badge */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <HeroCup />

              {/* Floating Badge Card (Top Right / As seen in Reference Video) */}
              <div
                className="absolute top-2 sm:top-6 right-2 sm:right-6 bg-[#1a110a]/90 backdrop-blur-md border border-[#3d2719] rounded-2xl p-4 text-[#f5f4ef] font-mono-code shadow-2xl max-w-[210px] hidden sm:block animate-float"
                style={{ animationDelay: '1.2s' }}
              >
                <div className="text-[9px] text-[#d4a373] tracking-widest uppercase mb-1">
                  // IN THE CUP
                </div>
                <div className="text-sm font-syne font-bold uppercase text-white">
                  HOUSE LATTE
                </div>
                <div className="text-base font-bold text-[#d4a373] mt-0.5">
                  ₹349.00 <span className="text-[10px] text-[#8c7b6d] font-normal">($4.20)</span>
                </div>
                <div className="mt-2 text-[9px] text-[#b5a898] border-t border-[#331f13] pt-1.5 uppercase leading-tight">
                  250 ML · BREWED DAILY TO GO
                </div>
              </div>
            </div>
          </div>

          {/* Hero Footer Meta Strip (As seen in Reference Video) */}
          <div className="mt-12 pt-6 border-t border-[#26160d] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code text-[#9e9080] uppercase tracking-widest items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>OPEN DAILY 07:00 — 21:00</span>
            </div>
            <div className="text-left sm:text-center flex items-center sm:justify-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>139 COFFEE STREET, SAN FRANCISCO</span>
            </div>
            <div className="text-left sm:text-right space-x-4">
              <span className="hover:text-white cursor-pointer transition-colors">INSTAGRAM</span>
              <span className="hover:text-white cursor-pointer transition-colors">TIKTOK</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MADE DAILY / FAVORITES (Minimal Brutalist 1px Bordered Grid)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-[#e5e2d6] pb-6">
          <div>
            <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase mb-1">
              // MADE DAILY
            </div>
            <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter text-[#120a06]">
              FAVORITES
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#120a06] hover:text-[#7d4826] transition-colors"
          >
            <span>View Full Menu</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* Minimalist 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#e2ddd1]">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-96 border-r border-b border-[#e2ddd1] p-6 animate-pulse bg-white/40"
              />
            ))
          ) : favorites.length > 0 ? (
            favorites.slice(0, 4).map((product, idx) => {
              const displayIndex = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={product.id}
                  className="group relative bg-[#f5f4ef] hover:bg-white transition-all duration-300 border-r border-b border-[#e2ddd1] p-6 flex flex-col justify-between"
                >
                  {/* Card Top: Number + Price */}
                  <div className="flex items-baseline justify-between font-mono-code text-xs text-[#7a6a58] mb-4">
                    <span className="font-bold text-[#120a06]">{displayIndex}</span>
                    <span className="font-bold text-[#120a06] text-sm">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Product Cut-Out Image */}
                  <Link
                    to={`/products/${product.slug}`}
                    className="relative aspect-square w-full my-auto flex items-center justify-center overflow-hidden py-4"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-48 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                    />
                  </Link>

                  {/* Card Bottom: Title & Quick Add */}
                  <div className="pt-4 border-t border-[#ece8de]">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/products/${product.slug}`}
                        className="font-syne text-sm font-bold uppercase tracking-tight text-[#120a06] hover:text-[#7d4826] transition-colors truncate"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="w-8 h-8 rounded-full border border-[#d8d2c4] bg-white group-hover:bg-[#120a06] group-hover:text-white group-hover:border-[#120a06] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                        title="Add to Order"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] font-mono-code text-[#8a7b6e] line-clamp-1 mt-1">
                      {product.description}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-4 p-12 text-center font-mono-code text-xs text-[#8a7b6e]">
              Loading menu items...
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUR LOCATIONS & THE INTERACTIVE CLOCK (Reference Video Frame 3)
          ========================================================================= */}
      <section id="locations" className="py-20 bg-[#eeebe2] border-y border-[#dfdad0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Locations List */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase mb-1">
                  // SAN FRANCISCO HOUSES
                </div>
                <h2 className="font-syne text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#120a06]">
                  OUR LOCATIONS
                </h2>
              </div>

              <div className="space-y-4 font-mono-code">
                {/* Location 1 */}
                <div className="bg-[#f5f4ef] p-5 rounded-2xl border border-[#ded8cb] shadow-xs flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#7a6a58]">01</span>
                    <h4 className="font-syne text-base font-bold uppercase text-[#120a06] mt-0.5">
                      139 COFFEE STREET, SOMA
                    </h4>
                    <p className="text-xs text-[#6e5e50] mt-1">
                      Flagship Roastery & Tasting Room
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    OPEN
                  </span>
                </div>

                {/* Location 2 */}
                <div className="bg-[#f5f4ef] p-5 rounded-2xl border border-[#ded8cb] shadow-xs flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#7a6a58]">02</span>
                    <h4 className="font-syne text-base font-bold uppercase text-[#120a06] mt-0.5">
                      310 VALENCIA ST, MISSION
                    </h4>
                    <p className="text-xs text-[#6e5e50] mt-1">
                      Espresso Bar & Artisan Pastry Lab
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    OPEN
                  </span>
                </div>

                {/* Location 3 */}
                <div className="bg-[#f5f4ef] p-5 rounded-2xl border border-[#ded8cb] shadow-xs flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#7a6a58]">03</span>
                    <h4 className="font-syne text-base font-bold uppercase text-[#120a06] mt-0.5">
                      56 COLUMBUS AVE, NORTH BEACH
                    </h4>
                    <p className="text-xs text-[#6e5e50] mt-1">
                      Walk-up Corner Espresso Window
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    OPEN
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono-code text-[#7a6a58] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7d4826]" />
                <span>MON — SUN: 07:00 — 21:00 DAILY</span>
              </div>
            </div>

            {/* Right: The Live Working Analog Clock with Iced Latte Center */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <AnalogClock />
              <p className="mt-4 text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase text-center">
                ● LIVE PACIFIC STANDARD TIME · BREWING CONSTANTLY
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PHILOSOPHY ("THE CITY NEVER STOPS" - Reference Video Frame 4)
          ========================================================================= */}
      <section
        id="philosophy"
        className="relative py-28 bg-[#140c08] text-[#f5f4ef] border-b border-[#2d1b11] overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono-code tracking-widest text-[#d4a373] uppercase">
            // OUR PHILOSOPHY
          </div>

          <h2 className="font-syne text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight leading-[1.05]">
            THE CITY NEVER STOPS.{' '}
            <span className="text-[#d4a373]">YOUR COFFEE SHOULDN'T SLOW YOU DOWN.</span>
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-mono-code text-[#b5a898] uppercase tracking-wider leading-relaxed">
            STAY FOR A CONVERSATION OR LEAVE WITH THE CUP IN YOUR HAND. CAREFULLY SOURCED,
            METICULOUSLY BREWED, SERVED WITH INTENTION.
          </p>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto border-t border-[#2d1b11]">
            <div className="p-4 space-y-1">
              <span className="text-2xl font-syne font-extrabold text-[#f5f4ef]">100%</span>
              <p className="text-[10px] font-mono-code text-[#d4a373] uppercase tracking-widest">
                ARABICA SPECIALTY
              </p>
            </div>
            <div className="p-4 space-y-1">
              <span className="text-2xl font-syne font-extrabold text-[#f5f4ef]">9 BAR</span>
              <p className="text-[10px] font-mono-code text-[#d4a373] uppercase tracking-widest">
                PRECISION EXTRACTION
              </p>
            </div>
            <div className="p-4 space-y-1">
              <span className="text-2xl font-syne font-extrabold text-[#f5f4ef]">24 HR</span>
              <p className="text-[10px] font-mono-code text-[#d4a373] uppercase tracking-widest">
                SLOW COLD STEEP
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INTERACTIVE THERMAL ORDER TICKET (Reference Video Frame 5 & 6)
          ========================================================================= */}
      <section className="py-24 bg-[#eeebe2] border-b border-[#dfdad0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase">
                // SPEED & CONVENIENCE
              </div>
              <h2 className="font-syne text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#120a06]">
                SKIP THE LINE. <br />
                ORDER AHEAD.
              </h2>
              <p className="text-xs sm:text-sm font-mono-code text-[#6e5e50] uppercase tracking-wider leading-relaxed">
                NO WAITING. YOUR CUP IS BREWED TO PERFECTION AND WAITING ON THE COUNTER WHEN
                YOU STEP THROUGH THE DOOR.
              </p>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#120a06] text-[#f5f4ef] text-xs font-mono-code font-bold uppercase tracking-wider hover:bg-[#2c1a10] transition-colors shadow-lg"
                >
                  <span>Start Your Order</span>
                  <ArrowRight className="w-4 h-4 text-[#d4a373]" />
                </Link>
              </div>
            </div>

            {/* Right: Thermal Receipt Printer Component */}
            <div className="lg:col-span-6">
              <ThermalTicket />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: NEWSLETTER / MORNING RITUAL
          ========================================================================= */}
      <section className="py-20 bg-[#f5f4ef]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase">
            // THE MORNING RITUAL
          </span>
          <h3 className="font-syne text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#120a06]">
            JOIN THE BREWNS COFFEE CLUB
          </h3>
          <p className="text-xs font-mono-code text-[#7a6a58] uppercase tracking-wider">
            RECEIVE FIRST-ACCESS COFFEE LOTS, TASTING NOTES & BARISTA SECRETS ONCE A WEEK.
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 p-4 bg-emerald-100 text-emerald-800 rounded-xl font-mono-code text-xs">
              <Check className="w-4 h-4" />
              <span>You're in the club! Watch your inbox every Tuesday morning.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                required
                placeholder="YOUR EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border border-[#d8d2c4] rounded-xl px-4 py-3 text-xs font-mono-code text-[#120a06] focus:outline-none focus:border-[#120a06]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#120a06] text-[#f5f4ef] text-xs font-mono-code font-bold uppercase tracking-wider rounded-xl hover:bg-[#2c1a10] transition-colors cursor-pointer"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
