import React from 'react';

export const HeroShowcase: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto h-[460px] sm:h-[520px] flex items-center justify-center select-none">
      {/* Ambient Radial Glow */}
      <div className="absolute w-72 h-72 bg-blue-600/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Metallic Spec Rings / Geometry */}
      <div className="absolute top-10 left-6 animate-float opacity-40">
        <div className="w-16 h-16 rounded-full border border-blue-400/40 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-blue-400/20" />
        </div>
      </div>

      <div className="absolute bottom-20 left-10 animate-float-reverse opacity-40">
        <div className="w-20 h-20 rounded-2xl border border-slate-600/40 rotate-12 flex items-center justify-center">
          <span className="text-[9px] font-mono-code text-blue-400 tracking-widest">ANC 40dB</span>
        </div>
      </div>

      <div className="absolute top-16 right-8 animate-float opacity-50">
        <div className="px-3 py-1 rounded-full border border-blue-500/40 bg-blue-950/30 text-[10px] font-mono-code text-blue-300">
          // TITANIUM DRIVER
        </div>
      </div>

      {/* Centerpiece Luxury Product Image */}
      <div className="relative z-10 w-full h-full flex items-center justify-center animate-float">
        <img
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=85"
          alt="AcousticPro ANC Wireless Headphones"
          className="max-h-[420px] sm:max-h-[460px] w-auto object-contain rounded-3xl drop-shadow-[0_35px_60px_rgba(0,0,0,0.9)] border border-slate-800/80"
        />
      </div>
    </div>
  );
};
