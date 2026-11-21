import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`, {
        icon: '🛍️',
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Space Mono',
          fontSize: '12px',
        },
      });
    } catch {
      toast.error('Failed to add to bag');
    }
  };

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <div className="group relative flex flex-col bg-[#f5f4ef] hover:bg-white transition-all duration-300 border border-[#ded8cb] overflow-hidden shadow-xs hover:shadow-lg">
      {/* Product Image */}
      <Link
        to={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-[#eeebe2] p-6 flex items-center justify-center"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
          alt={product.name}
          className="max-h-52 w-auto object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
          loading="lazy"
          onError={(e) => {
            // Elegant tech fallback if image fails to load
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>';
          }}
        />

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-3 left-3 bg-[#120a06] text-[#f5f4ef] font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Stock Status Badge */}
        {product.stock <= 0 ? (
          <div className="absolute inset-0 bg-[#120a06]/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-[#120a06] font-mono-code font-bold text-xs px-3 py-1 rounded-sm uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute bottom-3 left-3 bg-[#d4a373] text-[#120a06] font-mono-code text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
            {product.stock} Left
          </span>
        ) : null}
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-1 p-5 font-mono-code">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#8c7b6d] text-[10px] tracking-wider uppercase">
            {product.category?.name || 'SPECIALTY'}
          </span>
          <div className="flex items-center gap-1 text-[#7a6a58] text-[11px]">
            <Star className="w-3 h-3 fill-[#d4a373] stroke-[#d4a373]" />
            <span className="font-bold text-[#120a06]">
              {Number(product.rating || 4.9).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Name */}
        <Link
          to={`/products/${product.slug}`}
          className="font-syne font-bold text-base uppercase text-[#120a06] group-hover:text-[#7d4826] transition-colors mb-2 line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="text-[11px] text-[#6e5e50] line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-[#ded8cb] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#120a06]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-[#9c8e81] line-through">
                ₹{product.comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="w-8 h-8 rounded-full border border-[#ded8cb] bg-white group-hover:bg-[#120a06] group-hover:text-white group-hover:border-[#120a06] transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95"
            title="Add to Order"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
