import React from 'react';
import { ArrowRight, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DispatchTicket: React.FC = () => {
  return (
    <div className="relative max-w-sm mx-auto flex flex-col items-center select-none">
      {/* Sleek Metallic Slot Dispenser from Reference Design */}
      <div className="w-84 h-8 bg-gradient-to-b from-[#8e95a5] via-[#484e5f] to-[#1c202d] rounded-t-xl border-t border-x border-[#6b7280] shadow-2xl flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono-code text-white/90 tracking-widest uppercase">
            PRIORITY DISPATCH SYSTEM
          </span>
        </div>
        <span className="text-[9px] font-mono-code text-[#60a5fa] uppercase tracking-wider">
          AIR VERIFIED
        </span>
      </div>
      <div className="w-76 h-2 bg-[#0a0c12] rounded-full shadow-inner z-20 mb-[-1px]" />

      {/* Realistic Paper Packing Ticket */}
      <div
        className="relative w-80 bg-[#fafaf7] text-[#120a06] p-6 shadow-2xl border-x border-b border-[#ded9ce] rounded-b-lg font-mono-code animate-print-ticket z-10"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top Header */}
        <div className="text-center pb-3 border-b border-dashed border-[#c2b9a7]">
          <h4 className="font-syne text-xl font-extrabold uppercase tracking-tight text-[#120a06]">
            shopvista hardware lab
          </h4>
          <p className="text-[10px] text-[#554636] uppercase tracking-wider">
            San Francisco · Bengaluru · London
          </p>
          <div className="mt-1 inline-block text-[9px] font-bold bg-[#120a06] text-[#f5f4ef] px-2 py-0.5 rounded-xs tracking-widest">
            DISPATCH TICKET #00482
          </div>
        </div>

        {/* Product Preview */}
        <div className="py-4 space-y-3">
          <div className="flex items-center gap-3 bg-[#f0eee6] p-2.5 rounded-lg border border-[#e2ddd1]">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=80"
              alt="AcousticPro ANC"
              className="w-12 h-12 rounded-md object-cover border border-[#d8d2c4]"
            />
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs uppercase truncate max-w-[130px]">AcousticPro ANC</span>
                <span className="font-bold text-xs">₹12,999</span>
              </div>
              <p className="text-[9px] text-[#6e5d4e]">Titanium 40mm · Matte Black</p>
              <span className="text-[9px] text-emerald-700 font-semibold">Priority Air · Same-Day</span>
            </div>
          </div>

          <div className="space-y-1 text-[10px] text-[#4d3e31] pt-1 border-t border-[#e5dfd4]">
            <div className="flex justify-between">
              <span>ESTIMATED FULFILLMENT</span>
              <span className="font-bold text-emerald-700">TODAY, 18:00</span>
            </div>
            <div className="flex justify-between font-bold text-xs text-[#120a06] pt-1 border-t border-dashed border-[#c2b9a7]">
              <span>TOTAL VALUE</span>
              <span>₹12,999.00</span>
            </div>
          </div>
        </div>

        {/* Barcode Graphic */}
        <div className="py-2 text-center border-t border-b border-dashed border-[#c2b9a7]">
          <div className="h-8 w-48 mx-auto flex items-center justify-between px-2 overflow-hidden opacity-90">
            {[3, 1, 4, 1, 2, 5, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1].map((w, idx) => (
              <div
                key={idx}
                className="h-full bg-[#120a06]"
                style={{ width: `${w * 1.5}px` }}
              />
            ))}
          </div>
          <p className="text-[8px] tracking-widest text-[#7a6857] mt-1">
            * 2 0 2 6 - S H O P V I S T A - A I R *
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 text-center space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#120a06]">
            SKIP THE WAIT. SAME-DAY DISPATCH.
          </p>
          <Link
            to="/products"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#120a06] text-[#f5f4ef] text-xs font-bold font-mono-code uppercase tracking-wider rounded-lg hover:bg-[#2c1a10] transition-colors shadow-md"
          >
            <span>Order Now ➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
