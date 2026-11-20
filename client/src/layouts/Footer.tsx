import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Coffee, Sparkles, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0e0704] text-[#f5f4ef] border-t border-[#26160d] pt-16 pb-12 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4-Column Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-[#26160d]">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <h3 className="font-syne text-2xl font-extrabold tracking-tighter uppercase text-[#f5f4ef] lowercase">
              brewns<span className="text-xs text-[#d4a373] align-super">®</span>
            </h3>
            <p className="text-xs font-mono-code text-[#a89b8d] uppercase leading-relaxed tracking-wider">
              Specialty coffee house, micro-roaster, and artisan bakery based in San Francisco, California.
            </p>
            <div className="pt-2 text-[10px] font-mono-code text-[#d4a373] uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ROASTING & EXTRACTING LIVE DAILY</span>
            </div>
          </div>

          {/* Col 2: Houses & Locations */}
          <div className="space-y-3 font-mono-code text-xs">
            <h4 className="font-syne font-bold text-sm tracking-wider uppercase text-white mb-2">
              HOUSES
            </h4>
            <ul className="space-y-2 text-[#a89b8d] uppercase tracking-wider">
              <li className="hover:text-white transition-colors cursor-pointer">
                139 Coffee Street, SoMa
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                310 Valencia St, Mission
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                56 Columbus Ave, North Beach
              </li>
              <li className="pt-2 text-[10px] text-[#7a6857]">
                HOURS: MON — SUN 07:00 — 21:00
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Menu */}
          <div className="space-y-3 font-mono-code text-xs">
            <h4 className="font-syne font-bold text-sm tracking-wider uppercase text-white mb-2">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-[#a89b8d] uppercase tracking-wider">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Coffee & Beans
                </Link>
              </li>
              <li>
                <Link to="/products?category=hot-brews-espresso" className="hover:text-white transition-colors">
                  Espresso & Brews
                </Link>
              </li>
              <li>
                <Link to="/products?category=iced-cold-specialty" className="hover:text-white transition-colors">
                  Iced & Cold Drinks
                </Link>
              </li>
              <li>
                <Link to="/products?category=artisan-bakery" className="hover:text-white transition-colors">
                  Artisan Bakery
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Bag / Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payments & Guarantee */}
          <div className="space-y-3 font-mono-code text-xs">
            <h4 className="font-syne font-bold text-sm tracking-wider uppercase text-white mb-2">
              CHECKOUT
            </h4>
            <p className="text-[#a89b8d] uppercase text-[11px] leading-relaxed">
              Razorpay 256-bit secure gateway. Supporting UPI (GPay, PhonePe, Paytm), Netbanking, and major Credit Cards.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[9px] font-bold text-[#d4a373] bg-[#221309] border border-[#3b2314] px-2.5 py-1 rounded-md tracking-widest uppercase">
                SERVER VERIFIED PAYMENTS
              </span>
            </div>
          </div>
        </div>

        {/* Huge Typographic Watermark Branding */}
        <div className="pt-12 pb-6 text-center overflow-hidden">
          <span className="font-syne text-[72px] sm:text-[120px] md:text-[180px] lg:text-[220px] font-extrabold uppercase tracking-tighter text-[#180e09] block leading-none select-none hover:text-[#21140d] transition-colors">
            brewns®
          </span>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 border-t border-[#1d1007] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-code text-[11px] text-[#7a6a58] uppercase tracking-wider">
          <p>© 2026 BREWNS COFFEE HOUSE INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
            <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
            <span className="hover:text-white cursor-pointer transition-colors">WHOLESALE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
