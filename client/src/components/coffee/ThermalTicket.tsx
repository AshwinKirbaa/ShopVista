import React from 'react';
import { ArrowRight, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ThermalTicket: React.FC = () => {
  return (
    <div className="relative max-w-sm mx-auto flex flex-col items-center select-none">
      {/* Sleek Metallic Slot Dispenser from Reference Video */}
      <div className="w-84 h-8 bg-gradient-to-b from-[#8e8d88] via-[#52514d] to-[#242321] rounded-t-xl border-t border-x border-[#9e9d98] shadow-2xl flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono-code text-white/90 tracking-widest uppercase">
            THERMAL DISPENSER
          </span>
        </div>
        <span className="text-[9px] font-mono-code text-[#e8c8a7] uppercase tracking-wider">
          READY TO BREW
        </span>
      </div>
      <div className="w-76 h-2 bg-[#0d0704] rounded-full shadow-inner z-20 mb-[-1px]" />

      {/* Photorealistic Thermal Printed Ticket from Reference Video */}
      <div className="relative w-80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rounded-b-md overflow-hidden z-10 animate-print-ticket bg-[#faf9f5]">
        <img
          src="/assets/brewns/printer_receipt_complete.png"
          alt="brewns thermal order ahead ticket"
          className="w-full h-auto object-cover"
        />

        {/* Interactive CTA overlay linking to order flow */}
        <div className="p-3 bg-[#faf9f5] border-t border-dashed border-[#ded8cb]">
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
