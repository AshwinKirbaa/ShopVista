import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, itemCount, subtotal, shippingCharge, total } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-slate-400" />}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our curated collections."
          actionLabel="Explore Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono-code">
      <div className="mb-8 border-b border-[#ded8cb] pb-6">
        <span className="text-xs text-[#7a6a58] uppercase tracking-widest">
          // ORDER AHEAD BAG
        </span>
        <h1 className="font-syne text-4xl font-extrabold uppercase tracking-tight text-[#120a06] mt-1">
          YOUR COFFEE BAG ({itemCount})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#ded8cb] shadow-xs divide-y divide-[#ece8de] p-6">
          {cart.items.map((item) => (
            <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Product Thumbnail */}
              <Link
                to={`/products/${item.product.slug}`}
                className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200"
              >
                <img
                  src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Product Details */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-base line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-slate-400">SKU: {item.product.sku}</p>
                <p className="text-sm font-extrabold text-slate-900 pt-1">
                  ₹{item.product.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 px-2 py-1 justify-between gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="text-slate-500 hover:text-slate-900 p-1 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line Total & Remove */}
              <div className="text-right flex flex-col sm:items-end justify-between self-stretch">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{item.lineTotal.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-900">
                {shippingCharge === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                ) : (
                  `₹${shippingCharge}`
                )}
              </span>
            </div>

            {shippingCharge > 0 && (
              <p className="text-[11px] text-blue-600 bg-blue-50 p-2.5 rounded-xl">
                Add items worth ₹{(500 - subtotal).toLocaleString('en-IN')} more to unlock FREE Delivery!
              </p>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-xl text-blue-600">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              className="w-full shadow-lg shadow-blue-600/20"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Link to="/products" className="block text-center text-xs font-semibold text-slate-500 hover:text-blue-600">
              Continue Shopping
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 justify-center pt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Razorpay Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
