import React, { useState } from 'react';
import { ArrowRight, Check, Printer, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ThermalTicket: React.FC = () => {
  const [isPrinted, setIsPrinted] = useState(true);

  return (
    <div className="relative max-w-sm mx-auto flex flex-col items-center">
      {/* Sleek Ticket Machine Slot */}
      <div className="w-80 h-7 bg-[#1c120a] rounded-t-xl border-t border-x border-[#3b2517] shadow-xl flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono-code text-[#a89b8d] tracking-widest uppercase">
            THERMAL PRINTER
          </span>
        </div>
        <button
          onClick={() => {
            setIsPrinted(false);
            setTimeout(() => setIsPrinted(true), 150);
          }}
          className="text-[9px] font-mono-code text-[#d4a373] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Printer className="w-2.5 h-2.5" /> RE-PRINT
        </button>
      </div>
      <div className="w-72 h-1.5 bg-[#0a0503] rounded-full shadow-inner z-20 mb-[-1px]" />

      {/* Realistic Paper Thermal Ticket */}
      {isPrinted && (
        <div
          className="relative w-76 bg-[#faf9f5] text-[#120a06] p-6 shadow-2xl border-x border-b border-[#ded9ce] rounded-b-lg font-mono-code animate-print-ticket z-10"
          style={{
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top subtle zigzag tear pattern */}
          <div className="text-center pb-3 border-b border-dashed border-[#c2b9a7]">
            <h4 className="font-syne text-xl font-extrabold uppercase tracking-tight text-[#120a06]">
              brewns coffee house
            </h4>
            <p className="text-[10px] text-[#554636] uppercase tracking-wider">
              139 Coffee St, San Francisco, CA
            </p>
            <div className="mt-1 inline-block text-[9px] font-bold bg-[#120a06] text-[#f5f4ef] px-2 py-0.5 rounded-xs tracking-widest">
              ORDER AHEAD TICKET #00482
            </div>
          </div>

          {/* Ticket Product Preview */}
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 bg-[#f0eee6] p-2.5 rounded-lg border border-[#e2ddd1]">
              <img
                src="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=160&auto=format&fit=crop&q=80"
                alt="Iced Matcha"
                className="w-12 h-12 rounded-md object-cover border border-[#d8d2c4]"
              />
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase">1x Iced Matcha</span>
                  <span className="font-bold text-xs">₹375</span>
                </div>
                <p className="text-[9px] text-[#6e5d4e]">Ceremonial Uji · Oat Milk</p>
                <span className="text-[9px] text-emerald-700 font-semibold">Ready in 4 mins</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-[#4d3e31] pt-1 border-t border-[#e5dfd4]">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>₹375.00</span>
              </div>
              <div className="flex justify-between">
                <span>ESTIMATED TAX</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-[#120a06] pt-1 border-t border-dashed border-[#c2b9a7]">
                <span>TOTAL</span>
                <span>₹375.00</span>
              </div>
            </div>
          </div>

          {/* Thermal Barcode Graphic */}
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
              * 2 0 2 6 - B R E W N S - S F *
            </p>
          </div>

          {/* Tagline & Order Now CTA Button */}
          <div className="pt-4 text-center space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#120a06]">
              SKIP THE LINE. ORDER AHEAD.
            </p>
            <Link
              to="/products"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#120a06] text-[#f5f4ef] text-xs font-bold font-mono-code uppercase tracking-wider rounded-lg hover:bg-[#2c1a10] transition-colors shadow-md"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#d4a373]" />
            </Link>
          </div>

          {/* Jagged receipt edge bottom */}
          <div
            className="absolute -bottom-2 left-0 right-0 h-2 bg-repeat-x pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, transparent, transparent 50%, #faf9f5 50%, #faf9f5 100%)',
              backgroundSize: '10px 10px',
            }}
          />
        </div>
      )}
    </div>
  );
};
