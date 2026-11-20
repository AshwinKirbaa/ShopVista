import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 flex flex-col gap-3">
      <Skeleton className="w-full h-48 rounded-xl" />
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-4/5 h-5" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-20 h-9 rounded-xl" />
      </div>
    </div>
  );
};
