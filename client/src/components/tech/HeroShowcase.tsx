import React from 'react';

export const HeroShowcase: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto h-[440px] sm:h-[480px] flex items-center justify-center select-none">
      {/* Ambient Blue Backlight */}
      <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Modern Hardware Card Container */}
      <div className="relative z-10 w-80 sm:w-96 rounded-3xl overflow-hidden bg-gradient-to-b from-[#181d2f]/90 to-[#0e111a]/95 border border-[#2b334d] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-float">
        {/* Top Tag & Status */}
        <div className="flex items-center justify-between pb-4 border-b border-[#242b42] text-[10px] font-mono-code">
          <span className="text-[#60a5fa] font-bold tracking-widest uppercase">// PRO SERIES</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            IN STOCK
          </span>
        </div>

        {/* Product Image */}
        <div className="py-6 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=85"
            alt="AcousticPro ANC"
            className="max-h-56 w-auto object-contain rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Hardware Specs Strip */}
        <div className="pt-4 border-t border-[#242b42] flex items-center justify-between font-mono-code text-xs">
          <div>
            <h4 className="font-syne font-bold text-sm text-white uppercase tracking-tight">
              AcousticPro ANC
            </h4>
            <p className="text-[10px] text-[#7d87a4] uppercase mt-0.5">
              40mm Titanium · 45h Battery
            </p>
          </div>
          <div className="text-right">
            <span className="font-bold text-sm text-white">₹12,999</span>
            <p className="text-[9px] text-[#60a5fa] uppercase tracking-wider">$159 USD</p>
          </div>
        </div>
      </div>
    </div>
  );
};
