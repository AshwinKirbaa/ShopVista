import React, { useEffect, useState } from 'react';

export const AnalogClock: React.FC = () => {
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
    <div className="relative w-72 h-72 sm:w-88 sm:h-88 mx-auto flex items-center justify-center">
      {/* Outer Dial Circle */}
      <div className="absolute inset-0 rounded-full border border-[#2d1e16]/30 bg-[#ece8de]/60 backdrop-blur-xs shadow-inner flex items-center justify-center">
        {/* Hour tick marks */}
        {[...Array(12)].map((_, i) => {
          const rotation = i * 30;
          const isMain = i % 3 === 0;
          return (
            <div
              key={i}
              className="absolute w-full h-full flex justify-center items-start pt-2 pointer-events-none"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div
                className={`rounded-full ${
                  isMain ? 'w-1 h-3 bg-[#120a06]' : 'w-0.5 h-1.5 bg-[#120a06]/40'
                }`}
              />
            </div>
          );
        })}

        {/* Minimal Hour Numbers: 12, 3, 6, 9 */}
        <span className="absolute top-4 text-[11px] font-mono-code font-bold text-[#120a06]/70">12</span>
        <span className="absolute right-4 text-[11px] font-mono-code font-bold text-[#120a06]/70">3</span>
        <span className="absolute bottom-4 text-[11px] font-mono-code font-bold text-[#120a06]/70">6</span>
        <span className="absolute left-4 text-[11px] font-mono-code font-bold text-[#120a06]/70">9</span>
      </div>

      {/* Center Iced Latte Cup Illustration (Inside the clock dial like the reference video!) */}
      <div className="relative z-10 w-28 h-36 flex flex-col items-center justify-end select-none pointer-events-none">
        {/* Black Straw sticking out top */}
        <div
          className="w-1.5 h-14 bg-[#1a120c] rounded-full shadow-xs -mb-3 z-20"
          style={{ transform: 'rotate(-16deg)' }}
        />

        {/* Clear Glass Cup Body */}
        <div className="relative w-22 h-32 rounded-b-2xl border-2 border-white/60 bg-gradient-to-b from-white/30 via-amber-900/60 to-[#28150a] shadow-lg backdrop-blur-xs overflow-hidden flex flex-col justify-end p-1.5">
          {/* Floating Ice Cubes */}
          <div className="absolute top-4 left-3 w-4 h-4 rounded-xs bg-white/40 border border-white/70 rotate-12 backdrop-blur-xs" />
          <div className="absolute top-7 right-3 w-4.5 h-4.5 rounded-xs bg-white/30 border border-white/60 -rotate-12 backdrop-blur-xs" />
          <div className="absolute top-12 left-5 w-3.5 h-3.5 rounded-xs bg-white/35 border border-white/50 rotate-45" />

          {/* Coffee milk marbling waves */}
          <div className="w-full h-16 bg-gradient-to-t from-[#201007] via-[#7d4826] to-[#e4ceb5]/90 rounded-b-xl flex items-center justify-center">
            <span className="text-[8px] font-syne font-extrabold tracking-widest text-white/50 uppercase">
              brewns
            </span>
          </div>
        </div>
      </div>

      {/* Rotating Clock Hands */}
      {/* Hour Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      >
        <div className="w-1 h-16 bg-[#120a06] rounded-full -translate-y-8 shadow-xs" />
      </div>

      {/* Minute Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      >
        <div className="w-0.5 h-24 bg-[#120a06] rounded-full -translate-y-12 shadow-xs" />
      </div>

      {/* Second Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      >
        <div className="w-0.5 h-28 bg-[#d4a373] rounded-full -translate-y-12" />
        <div className="w-2 h-2 rounded-full bg-[#d4a373] absolute" />
      </div>

      {/* Center Pivot Pin */}
      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#120a06] z-40 border border-white shadow-xs" />
    </div>
  );
};
