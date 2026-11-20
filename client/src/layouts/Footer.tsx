import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090a10] text-[#f5f4ef] border-t border-[#1a1e2e] pt-16 pb-12 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4-Column Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-[#1a1e2e]">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <h3 className="font-syne text-2xl font-extrabold tracking-tighter uppercase text-[#f5f4ef] lowercase">
              shopvista<span className="text-xs text-[#3b82f6] align-super">®</span>
            </h3>
            <p className="text-xs font-mono-code text-[#8e97b0] uppercase leading-relaxed tracking-wider">
              Next-generation consumer hardware, minimalist mechanical tools, and modern everyday essentials.
            </p>
            <div className="pt-2 text-[10px] font-mono-code text-[#60a5fa] uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>GLOBAL FULFILLMENT HUBS ACTIVE</span>
            </div>
          </div>

          {/* Col 2: Hubs & Locations */}
          <div className="space-y-3 font-mono-code text-xs">
            <h4 className="font-syne font-bold text-sm tracking-wider uppercase text-white mb-2">
              HUBS
            </h4>
            <ul className="space-y-2 text-[#8e97b0] uppercase tracking-wider">
              <li className="hover:text-white transition-colors cursor-pointer">
                139 Market St, San Francisco
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                42 MG Road, Bengaluru
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                56 Shoreditch High St, London
              </li>
              <li className="pt-2 text-[10px] text-[#5d667e]">
                PRIORITY AIR SHIPPING 24/7
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Collections */}
          <div className="space-y-3 font-mono-code text-xs">
            <h4 className="font-syne font-bold text-sm tracking-wider uppercase text-white mb-2">
              COLLECTIONS
            </h4>
            <ul className="space-y-2 text-[#8e97b0] uppercase tracking-wider">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Hardware
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics-audio" className="hover:text-white transition-colors">
                  Audio & Acoustics
                </Link>
              </li>
              <li>
                <Link to="/products?category=mechanical-computing" className="hover:text-white transition-colors">
                  Computing Gear
                </Link>
              </li>
              <li>
                <Link to="/products?category=wearables-smart-tech" className="hover:text-white transition-colors">
                  Smart Wearables
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Bag / Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payments & Security */}
          <div className="space-y-3 font-mono-code text-xs">
            <h4 className="font-syne font-bold text-sm tracking-wider uppercase text-white mb-2">
              PAYMENTS
            </h4>
            <p className="text-[#8e97b0] uppercase text-[11px] leading-relaxed">
              Razorpay 256-bit encrypted checkout. Supporting UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit Cards.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[9px] font-bold text-[#60a5fa] bg-[#141b2d] border border-[#232f4e] px-2.5 py-1 rounded-md tracking-widest uppercase">
                SERVER VERIFIED PAYMENTS
              </span>
            </div>
          </div>
        </div>

        {/* Huge Typographic Watermark Branding */}
        <div className="pt-12 pb-6 text-center overflow-hidden">
          <span className="font-syne text-[68px] sm:text-[110px] md:text-[160px] lg:text-[200px] font-extrabold uppercase tracking-tighter text-[#121522] block leading-none select-none hover:text-[#171b2b] transition-colors">
            SHOPVISTA®
          </span>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 border-t border-[#141826] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-code text-[11px] text-[#6b758e] uppercase tracking-wider">
          <p>© 2026 SHOPVISTA HARDWARE LAB INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
            <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
            <span className="hover:text-white cursor-pointer transition-colors">WARRANTY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
