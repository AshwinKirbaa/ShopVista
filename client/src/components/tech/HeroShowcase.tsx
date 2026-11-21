import React from 'react';
import { Link } from 'react-router-dom';

export const HeroShowcase: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto h-[460px] sm:h-[490px] flex items-center justify-center select-none">
      {/* Cinematic Ambient Radial Glow */}
      <div className="absolute w-72 h-72 bg-blue-600/25 rounded-full blur-[110px] pointer-events-none" />

      {/* MotionSites Liquid Glass Hardware Container */}
      <div className="relative z-10 w-84 sm:w-96 rounded-3xl overflow-hidden bg-[#0e111a]/85 border border-white/15 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-float transition-all group">
        {/* Top Tag & Status */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 text-[10px] font-mono-code">
          <span className="text-blue-400 font-bold tracking-widest uppercase">// PRO SERIES 01</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            IN STOCK · DISPATCH TODAY
          </span>
        </div>

        {/* Video / Hardware Visual */}
        <Link
          to="/products/apple-iphone-17-black-256-gb-g4zqzk"
          className="relative my-4 flex items-center justify-center rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-[#141824] to-[#0a0b12] border border-white/5"
        >
          {/* MotionSites Looping Ambient Hardware Texture */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-screen pointer-events-none"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
          />

          {/* Genuine Authentic Catalog Hardware Render */}
          <img
            src="https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/2/p/o/-original-imahqvad9pbyujab.jpeg?q=70"
            alt="Apple iPhone 17"
            className="relative z-10 max-h-48 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay Pill Tag */}
          <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono-code text-[#a3a9be]">
            A19 PRO SILICON · 256GB
          </div>
        </Link>

        {/* Hardware Specs & Pricing */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between font-mono-code">
          <div>
            <h4 className="font-syne font-extrabold text-sm text-white uppercase tracking-tight">
              iPhone 17 Flagship
            </h4>
            <p className="text-[10px] text-[#7d87a4] uppercase mt-0.5">
              Grade 5 Titanium · Super Retina XDR
            </p>
          </div>
          <div className="text-right">
            <span className="font-syne font-bold text-base text-white">₹89,100</span>
            <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider">Verified Authentic</p>
          </div>
        </div>
      </div>
    </div>
  );
};
