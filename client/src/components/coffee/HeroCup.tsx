import React from 'react';

export const HeroCup: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto h-[420px] sm:h-[480px] flex items-center justify-center select-none">
      {/* Background Kraft Paper Coffee Bean Bag */}
      <div
        className="absolute w-52 sm:w-60 h-72 sm:h-80 bg-[#c2a27e] rounded-t-xl rounded-b-2xl shadow-2xl border border-[#9b7853] p-4 text-[#2d1b11] font-mono-code flex flex-col justify-between -left-2 sm:left-4 top-10 rotate-[-8deg] animate-float-reverse overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          background: 'linear-gradient(135deg, #d3b491 0%, #ba9872 60%, #9e7a53 100%)',
        }}
      >
        {/* Top fold line */}
        <div className="border-b border-[#8a6845] pb-2 flex justify-between items-center text-[9px] tracking-widest uppercase opacity-75">
          <span>WHOLE BEAN</span>
          <span>NET WT 250G</span>
        </div>

        {/* Center label stamp */}
        <div className="my-auto text-center space-y-1">
          <span className="inline-block text-[9px] uppercase tracking-widest text-[#5c3e24] bg-[#a88661]/40 px-2 py-0.5 rounded-sm">
            slow roast
          </span>
          <h4 className="font-syne text-2xl font-extrabold uppercase tracking-tight text-[#23140a]">
            brewns
          </h4>
          <p className="text-[10px] tracking-wider text-[#49301b]">
            HOUSE BLEND · LOT #40
          </p>
          <div className="pt-2 text-[9px] text-[#553b23] border-t border-[#8a6845]/50 leading-relaxed">
            Notes: caramel / brown sugar / roasted almond
          </div>
        </div>

        {/* Bottom air valve button */}
        <div className="flex justify-center items-center">
          <div className="w-5 h-5 rounded-full border border-[#856341] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5c3e24]" />
          </div>
        </div>
      </div>

      {/* Floating Coffee Beans (SVGs) */}
      <div className="absolute top-6 left-12 animate-float">
        <svg width="24" height="32" viewBox="0 0 24 32" className="text-[#3b2316] drop-shadow-lg opacity-80 rotate-45">
          <ellipse cx="12" cy="16" rx="9" ry="14" fill="#382115" />
          <path d="M12 4 Q15 16 12 28" stroke="#1d1009" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute bottom-16 left-6 animate-float-reverse">
        <svg width="20" height="28" viewBox="0 0 24 32" className="text-[#2b170c] drop-shadow-md opacity-70 -rotate-30">
          <ellipse cx="12" cy="16" rx="9" ry="14" fill="#2b170c" />
          <path d="M12 4 Q9 16 12 28" stroke="#140905" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute top-20 right-8 animate-float">
        <svg width="26" height="36" viewBox="0 0 24 32" className="text-[#301c10] drop-shadow-xl opacity-85 rotate-12">
          <ellipse cx="12" cy="16" rx="9" ry="14" fill="#301c10" />
          <path d="M12 4 Q16 16 12 28" stroke="#190d07" strokeWidth="2.5" fill="none" />
        </svg>
      </div>

      {/* Main 3D Realistic Paper Coffee Cup (Overlapping) */}
      <div
        className="relative z-20 w-52 sm:w-60 h-80 sm:h-92 flex flex-col items-center animate-float"
        style={{
          filter: 'drop-shadow(0 30px 40px rgba(0, 0, 0, 0.85))',
        }}
      >
        {/* Cup Drinking Lid */}
        <div className="relative w-44 sm:w-50 h-7 bg-gradient-to-r from-[#2a1b12] via-[#3d271a] to-[#25170f] rounded-t-lg border-t border-[#543826] shadow-md flex items-center justify-between px-6">
          <div className="w-6 h-1.5 rounded-full bg-[#160d08]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#160d08]" />
        </div>
        <div className="w-48 sm:w-54 h-3 bg-[#1d120c] rounded-b-sm border-b border-[#442b1c] shadow-xs" />

        {/* Paper Cup Cone Body */}
        <div
          className="relative w-42 sm:w-48 h-64 sm:h-76 bg-gradient-to-r from-[#e8e4db] via-[#f7f6f2] to-[#ded9ce] rounded-b-3xl border border-white/40 shadow-inner flex flex-col justify-between p-5 text-center overflow-hidden"
          style={{
            clipPath: 'polygon(4% 0%, 96% 0%, 88% 100%, 12% 100%)',
          }}
        >
          {/* Subtle paper grain highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/15 pointer-events-none" />

          {/* Top text stamp */}
          <div className="relative z-10 pt-2 text-[9px] font-mono-code font-bold tracking-widest text-[#665747] uppercase">
            // SPECIALTY ROAST
          </div>

          {/* Cup Center Branding Badge */}
          <div className="relative z-10 my-auto space-y-1">
            <h3 className="font-syne text-2xl sm:text-3xl font-extrabold tracking-tighter text-[#120a06] lowercase">
              brewns<span className="text-xs text-[#d4a373]">®</span>
            </h3>
            <p className="text-[10px] font-mono-code font-bold tracking-widest text-[#2a1a10] uppercase">
              COFFEE HOUSE
            </p>
            <div className="pt-2 text-[9px] font-mono-code tracking-wider text-[#7a6857] uppercase">
              GOOD COFFEE · GOOD MOOD
            </div>
          </div>

          {/* Cup Bottom Metric */}
          <div className="relative z-10 pb-4 text-[9px] font-mono-code font-bold tracking-widest text-[#7a6857] uppercase border-t border-[#d8d2c4] pt-2 flex justify-between items-center px-2">
            <span>250 ML</span>
            <span>BREWED DAILY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
