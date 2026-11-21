import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { productService } from '../services/product.service';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { HeroShowcase } from '../components/tech/HeroShowcase';
import { PrecisionDial } from '../components/tech/PrecisionDial';
import { DispatchTicket } from '../components/tech/DispatchTicket';
import toast from 'react-hot-toast';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    productService.getProducts({ limit: 12 }).then((res) => {
      if (res.success && res.data) {
        setProducts(res.data);
      }
    });
  }, []);

  const handleQuickAdd = async (productSlug: string, fallbackName: string, e: React.MouseEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.slug.includes(productSlug)) || products[0];
    if (product) {
      try {
        await addToCart(product, 1);
        toast.success(`${product.name} added to bag!`, {
          icon: '⚡',
          style: {
            background: '#0c0d14',
            color: '#f5f4ef',
            fontFamily: 'Space Mono',
            fontSize: '12px',
          },
        });
      } catch {
        toast.error('Failed to add to bag');
      }
    } else {
      toast.success(`${fallbackName} added to order!`, { icon: '⚡' });
    }
  };

  return (
    <div className="bg-[#f5f4ef] text-[#120a06] selection:bg-[#120a06] selection:text-[#f5f4ef] overflow-x-hidden">
      {/* =========================================================================
          HERO SECTION (Midnight Luxury Canvas with Hardware Showcase)
          ========================================================================= */}
      <section className="relative bg-[#0a0b12] text-[#f5f4ef] pt-8 pb-14 border-b border-[#1f2333]">
        {/* Subtle radial ambient warmth */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-blue-900/25 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[540px]">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category Subheading */}
              <div className="inline-flex items-center gap-2 text-xs font-mono-code tracking-widest text-[#60a5fa] uppercase">
                <span>// NEXT-GEN HARDWARE & DESIGN ESSENTIALS</span>
              </div>

              {/* Main Editorial Headline */}
              <div className="space-y-0 select-none">
                <h1 className="font-syne text-6xl sm:text-7xl md:text-8xl lg:text-[92px] font-extrabold uppercase tracking-tight text-white leading-[0.88]">
                  HARDWARE
                </h1>
                <div className="flex items-baseline gap-4 flex-wrap mt-1">
                  <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-extrabold uppercase tracking-tight text-white leading-[0.88]">
                    FOR YOUR
                  </h2>
                  <span className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-[96px] text-white lowercase -rotate-3 select-none">
                    everyday
                  </span>
                </div>
              </div>

              {/* Supporting Statement */}
              <p className="max-w-md text-xs sm:text-sm font-mono-code text-[#a3a9be] uppercase tracking-wider leading-relaxed pt-2">
                PREMIUM CRAFTED DEVICES AND THOUGHTFULLY ENGINEERED ESSENTIALS TO ELEVATE YOUR DAILY FLOW.
              </p>

              {/* Primary Underlined CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-5">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white border-b-2 border-white pb-1 hover:text-[#60a5fa] hover:border-[#60a5fa] transition-colors"
                >
                  <span>EXPLORE CATALOG</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Center-Right Hero Hardware Showcase */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <HeroShowcase />
            </div>
          </div>

          {/* Hero Footer Meta Strip (Exact Style from Reference) */}
          <div className="mt-12 pt-6 border-t border-[#1a1f33] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code text-[#7984a3] uppercase tracking-widest items-center">
            <div className="flex items-center gap-2">
              <span>GLOBAL FAST DISPATCH · 24/7</span>
            </div>
            <div className="text-left sm:text-center">
              <span>100% AUTHENTIC GUARANTEED HARDWARE</span>
            </div>
            <div className="text-left sm:text-right space-x-6">
              <span className="hover:text-white cursor-pointer transition-colors">INSTAGRAM</span>
              <span className="hover:text-white cursor-pointer transition-colors">TWITTER</span>
              <span className="hover:text-white cursor-pointer transition-colors">GITHUB</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: // OUR CATALOG -> FAVORITES CURATED DAILY (Exact Reference Style)
          ========================================================================= */}
      <section className="relative py-20 bg-[#f5f4ef] border-b border-[#ded8cb] overflow-hidden">
        {/* Faint Signature Watermark 'v.' in background */}
        <div className="absolute top-10 right-20 text-[260px] font-script text-[#ded8cb]/40 select-none pointer-events-none -rotate-12 leading-none">
          v.
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase mb-2">
                // CURATED HARDWARE
              </div>
              <div className="space-y-0">
                <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#120a06] leading-[0.9]">
                  FAVORITES
                </h2>
                <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#120a06] leading-[0.9]">
                  CURATED
                </h2>
                <div className="flex items-baseline gap-6 flex-wrap">
                  <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#120a06] leading-[0.9]">
                    DAILY
                  </h2>
                  <p className="max-w-xs text-[11px] font-mono-code text-[#7a6a58] uppercase tracking-wider leading-relaxed">
                    INNOVATIVE ENGINEERING, CAREFULLY SOURCED. MINIMAL, POWERFUL AND BUILT TO LAST.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#120a06] border-b border-[#120a06] pb-1 hover:text-[#2563eb] hover:border-[#2563eb] transition-colors self-start md:self-end"
            >
              <span>VIEW FULL CATALOG</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          {/* 4 Clean Minimalist Square 1px Bordered Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: APPLE IPHONE 17 */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-xl transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">01</span>
                <button
                  onClick={(e) => handleQuickAdd('apple-iphone-17', 'Apple iPhone 17 (Black, 256 GB)', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <Link to="/products/apple-iphone-17-black-256-gb-g4zqzk" className="my-auto flex items-center justify-center py-2">
                <img
                  src="https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/2/p/o/-original-imahqvad9pbyujab.jpeg?q=70"
                  alt="Apple iPhone 17"
                  className="max-h-40 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </Link>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider truncate max-w-[130px]">IPHONE 17 (256GB)</span>
                <span className="font-bold">₹89,100</span>
              </div>
            </div>

            {/* Card 2: LENOVO THINKPAD E14 */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-xl transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">02</span>
                <button
                  onClick={(e) => handleQuickAdd('lenovo-thinkpad', 'Lenovo ThinkPad E14', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <Link to="/products/lenovo-thinkpad-e14-gen-5-amd-ryzen-5-7th-gen-7430u-16-gb-512-gb-ssd-windows-11--dtf6uc" className="my-auto flex items-center justify-center py-2">
                <img
                  src="https://rukminim2.flixcart.com/image/312/312/xif0q/computer/e/o/n/thinkpad-e14-business-laptop-lenovo-original-imah7qfvgmgmyzfu.jpeg?q=70"
                  alt="Lenovo ThinkPad E14"
                  className="max-h-36 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </Link>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider truncate max-w-[130px]">THINKPAD E14</span>
                <span className="font-bold">₹95,606</span>
              </div>
            </div>

            {/* Card 3: SONY WH-CH530 */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-xl transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">03</span>
                <button
                  onClick={(e) => handleQuickAdd('sony-wh', 'Sony WH-CH530 Headphones', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <Link to="/products/sony-wh-ch530-55-hour-battery-ai-call-bluetooth-czthsx" className="my-auto flex items-center justify-center py-2">
                <img
                  src="https://rukminim2.flixcart.com/image/612/612/xif0q/headphone/c/a/o/-original-imahst46g6zftjsd.jpeg?q=70"
                  alt="Sony WH-CH530"
                  className="max-h-40 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </Link>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider truncate max-w-[130px]">SONY WH-CH530</span>
                <span className="font-bold">₹4,490</span>
              </div>
            </div>

            {/* Card 4: RGB GAMING COMBO */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-xl transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">04</span>
                <button
                  onClick={(e) => handleQuickAdd('gaming-keyboard', 'Ninja RGB Mechanical Combo', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <Link to="/products/zebion-ninja-premium-rgb-backlit-gaming-keyboard-metal-body-mouse-with-6-button--dxxzvs" className="my-auto flex items-center justify-center py-2">
                <img
                  src="https://rukminim2.flixcart.com/image/612/612/xif0q/computer-acc-combo/q/j/h/ninja-premium-rgb-backlit-gaming-keyboard-metal-body-mouse-with-original-imah94dc87cw8gf7.jpeg?q=70"
                  alt="Ninja RGB Gaming Combo"
                  className="max-h-36 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </Link>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider truncate max-w-[130px]">RGB GAMING COMBO</span>
                <span className="font-bold">₹949</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: // GLOBAL HUBS & PRECISION TIME (Exact Reference Style)
          ========================================================================= */}
      <section id="locations" className="py-24 bg-[#f5f4ef] border-b border-[#ded8cb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Locations List */}
            <div className="lg:col-span-5 space-y-10">
              <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase">
                // GLOBAL FULFILLMENT HUBS
              </div>

              <div className="space-y-8 font-mono-code text-xs uppercase tracking-wider text-[#120a06]">
                <div className="border-l-2 border-[#120a06] pl-4 space-y-1">
                  <h4 className="font-bold text-sm">EXPERIENCE CENTER</h4>
                  <p className="text-[#6e5e50]">139 MARKET STREET, SAN FRANCISCO</p>
                </div>

                <div className="border-l-2 border-[#120a06] pl-4 space-y-1">
                  <h4 className="font-bold text-sm">HARDWARE & TECH HUB</h4>
                  <p className="text-[#6e5e50]">42 MG ROAD, INDIRANAGAR, BENGALURU</p>
                </div>

                <div className="border-l-2 border-[#120a06] pl-4 space-y-1">
                  <h4 className="font-bold text-sm">INNOVATION DESIGN LAB</h4>
                  <p className="text-[#6e5e50]">56 SHOREDITCH HIGH ST, LONDON</p>
                </div>
              </div>

              <div className="text-xs font-mono-code text-[#7a6a58] uppercase tracking-wider">
                WORLDWIDE SAME-DAY AIR DISPATCH
              </div>
            </div>

            {/* Right: The Live Precision Chronograph */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <PrecisionDial />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE WORLD NEVER STOPS (Exact Reference Style)
          ========================================================================= */}
      <section
        id="philosophy"
        className="relative py-28 bg-[#0a0b12] text-[#f5f4ef] border-b border-[#1f2333] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Floating Device Component */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
                alt="Precision Computing"
                className="max-h-72 w-auto object-contain rounded-3xl shadow-2xl animate-float border border-[#2b334d]"
              />
            </div>

            {/* Right Headline & Philosophy */}
            <div className="lg:col-span-8 space-y-8">
              <h2 className="font-syne text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.98]">
                THE WORLD NEVER STOPS. <br />
                YOUR GEAR SHOULDN'T SLOW YOU DOWN.
              </h2>

              <div className="pt-2 border-t border-[#1f2333] grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-2">
                  <div className="text-xs font-mono-code text-[#60a5fa] uppercase tracking-widest">
                    // OUR PHILOSOPHY
                  </div>
                  <p className="text-xs sm:text-sm font-mono-code text-[#a3a9be] uppercase tracking-wider leading-relaxed">
                    STAY IN THE FLOW OR TAKE IT ON THE GO. PRECISION CRAFTED, RIGOROUSLY TESTED,
                    DESIGNED WITH INTENTION. NOTHING SUPERFLUOUS, AND EVERYTHING BUILT FOR PURE
                    PERFORMANCE.
                  </p>
                </div>

                <div className="md:col-span-4 space-y-2 font-mono-code text-xs text-white uppercase tracking-widest border-l border-[#1f2333] pl-6">
                  <p>GRADE 5 TITANIUM.</p>
                  <p>LOW LATENCY.</p>
                  <p>2-YEAR WARRANTY.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: SKIP THE WAIT. SAME-DAY DISPATCH. & PACKING SLIP
          ========================================================================= */}
      <section className="relative py-28 bg-[#10121d] text-[#f5f4ef] border-b border-[#1f2333] overflow-hidden">
        {/* Large Watermark Heading */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center opacity-10 select-none pointer-events-none">
          <span className="font-syne text-6xl sm:text-8xl md:text-[140px] font-extrabold uppercase tracking-tighter text-white">
            HARDWARE FOR RIGHT NOW
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-12">
            {/* The Interactive Dispatch Ticket Machine */}
            <DispatchTicket />

            {/* Bottom Descriptive Narrative Strip (Exact Reference Style) */}
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/20 font-mono-code text-xs uppercase tracking-wider text-[#d8d2c4]">
              <div>
                <p className="leading-relaxed">
                  WE HANDLE THE CRAFT. YOU TAKE ON THE DAY.
                </p>
              </div>
              <div className="space-y-3">
                <p className="leading-relaxed text-[#a3a9be]">
                  WE WORK TO ONE SCHEDULE: YOURS. ORDER AHEAD AND YOUR GEAR IS DISPATCHED IMMEDIATELY VIA PRIORITY AIR TO MEET YOU WITHOUT DELAYS.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 font-bold text-white hover:text-[#60a5fa] transition-colors border-b border-white pb-0.5"
                >
                  <span>ORDER RIGHT NOW</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
