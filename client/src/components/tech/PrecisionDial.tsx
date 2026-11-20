import React, { useEffect, useState } from 'react';

export const PrecisionDial: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] mx-auto flex items-center justify-center select-none">
      {/* Outer Chronograph Dial Circle */}
      <div className="absolute inset-0 rounded-full border border-[#120a06]/30 bg-white shadow-xl flex items-center justify-center">
        {/* 60 Tick marks around circumference */}
        {[...Array(60)].map((_, i) => {
          const rotation = i * 6;
          const isMain = i % 5 === 0;
          return (
            <div
              key={i}
              className="absolute w-full h-full flex justify-center items-start pt-2 pointer-events-none"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div
                className={`rounded-full ${
                  isMain ? 'w-1 h-3.5 bg-[#120a06]' : 'w-0.5 h-1.5 bg-[#120a06]/30'
                }`}
              />
            </div>
          );
        })}

        {/* Clean Numerals: 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          // Radius offset inside the dial
          const r = 145; // in pixels
          const x = Math.sin(angle) * r;
          const y = -Math.cos(angle) * r;
          return (
            <span
              key={num}
              className="absolute font-mono-code font-bold text-xs text-[#120a06] tracking-tight pointer-events-none"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              {num}
            </span>
          );
        })}
      </div>

      {/* Centerpiece Titanium Smartwatch / Gear */}
      <div className="relative z-10 w-36 h-36 rounded-full overflow-hidden shadow-2xl border-4 border-[#120a06] bg-slate-900 pointer-events-none flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"
          alt="ApexFit Titanium Smartwatch"
          className="w-full h-full object-cover scale-110"
        />
        {/* Subtle center logo badge */}
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          <span className="text-[9px] font-syne font-extrabold tracking-widest text-white/80 uppercase">
            shopvista
          </span>
        </div>
      </div>

      {/* Rotating Clock Hands overlaying precisely */}
      {/* Hour Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      >
        <div className="w-1.5 h-22 bg-[#120a06] rounded-full -translate-y-11 shadow-sm" />
      </div>

      {/* Minute Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      >
        <div className="w-1 h-34 bg-[#120a06] rounded-full -translate-y-17 shadow-sm" />
      </div>

      {/* Second Hand (Thin sweeping blue indicator) */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      >
        <div className="w-0.5 h-38 bg-[#3b82f6] rounded-full -translate-y-16" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] absolute" />
      </div>

      {/* Center Pivot Pin */}
      <div className="absolute w-3.5 h-3.5 rounded-full bg-[#120a06] z-40 border-2 border-white shadow-xs" />
    </div>
  );
};
