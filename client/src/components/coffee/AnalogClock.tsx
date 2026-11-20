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
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] mx-auto flex items-center justify-center select-none">
      {/* Photorealistic Clock Face with Center Iced Latte Cup from Reference Video */}
      <img
        src="/assets/brewns/clock_dial_clean.png"
        alt="brewns live clock dial"
        className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
      />

      {/* Rotating Clock Hands overlaying precisely */}
      {/* Hour Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      >
        <div className="w-1.5 h-20 bg-[#120a06] rounded-full -translate-y-10 shadow-sm" />
      </div>

      {/* Minute Hand */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      >
        <div className="w-1 h-32 bg-[#120a06] rounded-full -translate-y-16 shadow-sm" />
      </div>

      {/* Second Hand (Thin sweeping amber needle) */}
      <div
        className="absolute w-full h-full flex justify-center items-center pointer-events-none z-30"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      >
        <div className="w-0.5 h-36 bg-[#d4a373] rounded-full -translate-y-16" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#d4a373] absolute" />
      </div>

      {/* Center Pivot Pin */}
      <div className="absolute w-3 h-3 rounded-full bg-[#120a06] z-40 border-2 border-white shadow-xs" />
    </div>
  );
};
