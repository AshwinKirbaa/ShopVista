import React from 'react';

export const HeroCup: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto h-[460px] sm:h-[520px] flex items-center justify-center select-none">
      {/* Floating Coffee Bean SVGs with subtle animation */}
      <div className="absolute top-10 left-6 animate-float">
        <svg width="28" height="36" viewBox="0 0 24 32" className="text-[#3b2316] drop-shadow-xl opacity-90 rotate-45">
          <ellipse cx="12" cy="16" rx="9" ry="14" fill="#2d1a0e" />
          <path d="M12 4 Q15 16 12 28" stroke="#120803" strokeWidth="2.5" fill="none" />
        </svg>
      </div>

      <div className="absolute bottom-20 left-12 animate-float-reverse">
        <svg width="22" height="30" viewBox="0 0 24 32" className="text-[#2b170c] drop-shadow-lg opacity-80 -rotate-30">
          <ellipse cx="12" cy="16" rx="9" ry="14" fill="#22130a" />
          <path d="M12 4 Q9 16 12 28" stroke="#100602" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute top-16 right-10 animate-float">
        <svg width="26" height="34" viewBox="0 0 24 32" className="text-[#301c10] drop-shadow-xl opacity-85 rotate-12">
          <ellipse cx="12" cy="16" rx="9" ry="14" fill="#2d190d" />
          <path d="M12 4 Q16 16 12 28" stroke="#150803" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Photorealistic 3D Paper Cup & Kraft Coffee Bag from Reference Video */}
      <div className="relative z-10 w-full h-full flex items-center justify-center animate-float">
        <img
          src="/assets/brewns/hero_cup_bag.jpg"
          alt="brewns® specialty cup and slow roast bag"
          className="max-h-[480px] sm:max-h-[520px] w-auto object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.9)]"
          style={{
            maskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 80%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 80%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
};
