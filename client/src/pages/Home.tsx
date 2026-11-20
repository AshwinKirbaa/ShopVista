import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  MapPin,
  Plus,
} from 'lucide-react';
import { productService } from '../services/product.service';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { HeroCup } from '../components/coffee/HeroCup';
import { AnalogClock } from '../components/coffee/AnalogClock';
import { ThermalTicket } from '../components/coffee/ThermalTicket';
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
    } else {
      toast.success(`${fallbackName} added to order!`, { icon: '☕' });
    }
  };

  return (
    <div className="bg-[#f5f4ef] text-[#120a06] selection:bg-[#120a06] selection:text-[#f5f4ef] overflow-x-hidden">
      {/* =========================================================================
          HERO SECTION (Reference Video Frame 0)
          ========================================================================= */}
      <section className="relative bg-[#120905] text-[#f5f4ef] pt-8 pb-14 border-b border-[#26150b]">
        {/* Subtle radial ambient warmth */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-[#3a1b0d]/50 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[540px]">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category Subheading */}
              <div className="inline-flex items-center gap-2 text-xs font-mono-code tracking-widest text-[#a89b8d] uppercase">
                <span>// SPECIALTY COFFEE HOUSE</span>
              </div>

              {/* Main Editorial Headline */}
              <div className="space-y-0 select-none">
                <h1 className="font-syne text-6xl sm:text-7xl md:text-8xl lg:text-[92px] font-extrabold uppercase tracking-tight text-white leading-[0.88]">
                  COFFEE
                </h1>
                <div className="flex items-baseline gap-4 flex-wrap mt-1">
                  <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-extrabold uppercase tracking-tight text-white leading-[0.88]">
                    FOR YOUR
                  </h2>
                  <span className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-[96px] text-white lowercase -rotate-3 select-none">
                    moment
                  </span>
                </div>
              </div>

              {/* Supporting Statement */}
              <p className="max-w-md text-xs sm:text-sm font-mono-code text-[#c4b9aa] uppercase tracking-wider leading-relaxed pt-2">
                CAREFULLY SOURCED BEANS AND THOUGHTFULLY BREWED TO BRING OUT THE BEST IN EVERY CUP.
              </p>

              {/* Primary Underlined CTA */}
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white border-b-2 border-white pb-1 hover:text-[#d4a373] hover:border-[#d4a373] transition-colors"
                >
                  <span>EXPLORE MENU</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Center-Right Hero Cup Visual & Floating Badge */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <HeroCup />

              {/* Floating Badge Card (Top Right / Exact replica of Reference Video Frame 0) */}
              <div className="absolute top-2 sm:top-6 right-2 sm:right-6 bg-[#160d08]/90 backdrop-blur-md border border-[#382215] rounded-xl p-4 text-[#f5f4ef] font-mono-code shadow-2xl max-w-[210px] hidden sm:block">
                <div className="text-[9px] text-[#a89b8d] tracking-widest uppercase mb-1">
                  // IN THE CUP
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-syne font-bold uppercase text-white">HOUSE LATTE</span>
                  <span className="text-sm font-bold text-white">$4.20</span>
                </div>
                <div className="mt-2 text-[9px] text-[#9e9080] border-t border-[#2d1b11] pt-1.5 uppercase leading-tight tracking-wider">
                  250 ML · BREWED DAILY TO GO
                </div>
              </div>
            </div>
          </div>

          {/* Hero Footer Meta Strip (Exact replica of Reference Video Frame 0) */}
          <div className="mt-12 pt-6 border-t border-[#24140b] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code text-[#9e9080] uppercase tracking-widest items-center">
            <div className="flex items-center gap-2">
              <span>OPEN DAILY 07:00 — 21:00</span>
            </div>
            <div className="text-left sm:text-center">
              <span>139 COFFEE STREET, SAN FRANCISCO, CA</span>
            </div>
            <div className="text-left sm:text-right space-x-6">
              <span className="hover:text-white cursor-pointer transition-colors">INSTAGRAM</span>
              <span className="hover:text-white cursor-pointer transition-colors">TIKTOK</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: // OUR MENU -> FAVORITES MADE DAILY (Reference Video Frame 1 & 2)
          ========================================================================= */}
      <section className="relative py-20 bg-[#f5f4ef] border-b border-[#ded8cb] overflow-hidden">
        {/* Faint Signature Watermark 'b.' in background */}
        <div className="absolute top-10 right-20 text-[260px] font-script text-[#ded8cb]/40 select-none pointer-events-none -rotate-12 leading-none">
          b.
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase mb-2">
                // OUR MENU
              </div>
              <div className="space-y-0">
                <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#120a06] leading-[0.9]">
                  FAVORITES
                </h2>
                <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#120a06] leading-[0.9]">
                  MADE
                </h2>
                <div className="flex items-baseline gap-6 flex-wrap">
                  <h2 className="font-syne text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-[#120a06] leading-[0.9]">
                    DAILY
                  </h2>
                  <p className="max-w-xs text-[11px] font-mono-code text-[#7a6a58] uppercase tracking-wider leading-relaxed">
                    QUALITY INGREDIENTS, CAREFULLY PREPARED. SIMPLE, BALANCED AND MADE TO ENJOY.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-[#120a06] border-b border-[#120a06] pb-1 hover:text-[#7d4826] hover:border-[#7d4826] transition-colors self-start md:self-end"
            >
              <span>VIEW FULL MENU</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          {/* 4 Clean Minimalist Square 1px Bordered Cards (Exact replicas from Video) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: ESPRESSO */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-lg transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">01</span>
                <button
                  onClick={(e) => handleQuickAdd('espresso', 'Single Shot Espresso', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="my-auto flex items-center justify-center py-2">
                <img
                  src="/assets/brewns/cup_espresso.png"
                  alt="Espresso"
                  className="max-h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider">ESPRESSO</span>
                <span className="font-bold">$2.50</span>
              </div>
            </div>

            {/* Card 2: LATTE */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-lg transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">02</span>
                <button
                  onClick={(e) => handleQuickAdd('latte', 'House Latte', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="my-auto flex items-center justify-center py-2">
                <img
                  src="/assets/brewns/cup_latte.png"
                  alt="Latte"
                  className="max-h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider">LATTE</span>
                <span className="font-bold">$4.20</span>
              </div>
            </div>

            {/* Card 3: ICED MATCHA */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-lg transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">03</span>
                <button
                  onClick={(e) => handleQuickAdd('matcha', 'Iced Matcha Latte', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="my-auto flex items-center justify-center py-2">
                <img
                  src="/assets/brewns/cup_matcha.png"
                  alt="Iced Matcha"
                  className="max-h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider">ICED MATCHA</span>
                <span className="font-bold">$4.50</span>
              </div>
            </div>

            {/* Card 4: CINNAMON ROLL */}
            <div className="group relative bg-[#f5f4ef] border border-[#120a06] p-5 flex flex-col justify-between aspect-square hover:shadow-lg transition-all">
              <div className="flex justify-between items-start font-mono-code text-xs text-[#7a6a58]">
                <span className="font-bold text-[#120a06]">04</span>
                <button
                  onClick={(e) => handleQuickAdd('cinnamon', 'Artisan Cinnamon Roll', e)}
                  className="w-6 h-6 rounded-full border border-[#120a06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#120a06] hover:text-white"
                  title="Add to order"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="my-auto flex items-center justify-center py-2">
                <img
                  src="/assets/brewns/plate_cinnamon.png"
                  alt="Cinnamon Roll"
                  className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex justify-between items-baseline font-mono-code text-xs text-[#120a06] uppercase pt-2 border-t border-[#ded8cb]">
                <span className="font-bold tracking-wider">CINNAMON ROLL</span>
                <span className="font-bold">$3.80</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: // OUR LOCATIONS & CLOCK (Reference Video Frame 3 & 4)
          ========================================================================= */}
      <section id="locations" className="py-24 bg-[#f5f4ef] border-b border-[#ded8cb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Locations List */}
            <div className="lg:col-span-5 space-y-10">
              <div className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase">
                // OUR LOCATIONS
              </div>

              <div className="space-y-8 font-mono-code text-xs uppercase tracking-wider text-[#120a06]">
                <div className="border-l-2 border-[#120a06] pl-4 space-y-1">
                  <h4 className="font-bold text-sm">139 COFFEE STREET</h4>
                  <p className="text-[#6e5e50]">SAN FRANCISCO, CA</p>
                </div>

                <div className="border-l-2 border-[#120a06] pl-4 space-y-1">
                  <h4 className="font-bold text-sm">310 VALENCIA ST</h4>
                  <p className="text-[#6e5e50]">SAN FRANCISCO, CA</p>
                </div>

                <div className="border-l-2 border-[#120a06] pl-4 space-y-1">
                  <h4 className="font-bold text-sm">56 COLUMBUS AVENUE</h4>
                  <p className="text-[#6e5e50]">SAN FRANCISCO, CA</p>
                </div>
              </div>

              <div className="text-xs font-mono-code text-[#7a6a58] uppercase tracking-wider">
                OPEN DAILY 07:00 — 21:00
              </div>
            </div>

            {/* Right: The Live Clock Face with Centered Iced Latte */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <AnalogClock />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE CITY NEVER STOPS (Reference Video Frame 5 & 6)
          ========================================================================= */}
      <section
        id="philosophy"
        className="relative py-28 bg-[#120905] text-[#f5f4ef] border-b border-[#26150b] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Floating Cup */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <img
                src="/assets/brewns/floating_cup.jpg"
                alt="Floating coffee cup"
                className="max-h-72 w-auto object-contain rounded-2xl shadow-2xl animate-float"
                style={{
                  maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 75%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 75%, transparent 100%)',
                }}
              />
            </div>

            {/* Right Headline & Philosophy */}
            <div className="lg:col-span-8 space-y-8">
              <h2 className="font-syne text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.98]">
                THE CITY NEVER STOPS. <br />
                YOUR COFFEE SHOULDN'T SLOW YOU DOWN.
              </h2>

              <div className="pt-2 border-t border-[#2d1b11] grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-2">
                  <div className="text-xs font-mono-code text-[#a89b8d] uppercase tracking-widest">
                    // OUR PHILOSOPHY
                  </div>
                  <p className="text-xs sm:text-sm font-mono-code text-[#c4b9aa] uppercase tracking-wider leading-relaxed">
                    STAY FOR A CONVERSATION OR LEAVE WITH THE CUP IN YOUR HAND — BOTH WORK,
                    NEITHER TAKES ANY EFFORT. NOTHING HERE IS RUSHED, AND NOTHING KEEPS YOU
                    LONGER THAN YOU MEANT TO STAY.
                  </p>
                </div>

                <div className="md:col-span-4 space-y-2 font-mono-code text-xs text-[#e8c8a7] uppercase tracking-widest border-l border-[#2d1b11] pl-6">
                  <p>GOOD COFFEE.</p>
                  <p>NO CEREMONY.</p>
                  <p>NO WAITING.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: SKIP THE LINE. ORDER AHEAD. & THERMAL TICKET (Reference Video Frame 6 & 7)
          ========================================================================= */}
      <section className="relative py-28 bg-[#1a110a] text-[#f5f4ef] border-b border-[#2d1b11] overflow-hidden">
        {/* Background Table with Matcha Cheesecake from Reference Video */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{ backgroundImage: 'url(/assets/brewns/cheesecake_full_table.jpg)' }}
        />

        {/* Large Watermark Heading */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center opacity-10 select-none pointer-events-none">
          <span className="font-syne text-6xl sm:text-8xl md:text-[140px] font-extrabold uppercase tracking-tighter text-white">
            COFFEE FOR RIGHT NOW
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-12">
            {/* The Interactive Thermal Ticket Machine */}
            <ThermalTicket />

            {/* Bottom Descriptive Narrative Strip (From Reference Video) */}
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/20 font-mono-code text-xs uppercase tracking-wider text-[#d8d2c4]">
              <div>
                <p className="leading-relaxed">
                  WE HANDLE THE CRAFT. YOU TAKE ON THE DAY.
                </p>
              </div>
              <div className="space-y-3">
                <p className="leading-relaxed text-[#b5a898]">
                  WE WORK TO ONE SCHEDULE: YOURS. ORDER AHEAD AND YOUR CUP IS POURED TO MEET YOU, NOT TO SIT WAITING. FAST BECAUSE IT'S TIMED TO YOU, NOT BECAUSE IT'S RUSHED.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4a373] transition-colors border-b border-white pb-0.5"
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
