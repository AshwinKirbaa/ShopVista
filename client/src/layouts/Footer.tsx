import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800 text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Free Delivery</h4>
              <p className="text-xs text-slate-400">On all orders above ₹500</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-400">Verified Razorpay 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800 text-blue-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Replacement</h4>
              <p className="text-xs text-slate-400">7-day hassle free returns</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800 text-blue-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-400">Expert customer assistance</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Shop<span className="text-blue-500">Vista</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discover curated luxury essentials, cutting-edge electronics, and lifestyle upgrades with seamless checkout and guaranteed authenticity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-blue-400 transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-blue-400 transition-colors">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/products?category=electronics-gadgets" className="hover:text-blue-400 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion-apparel" className="hover:text-blue-400 transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-living" className="hover:text-blue-400 transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=sports-fitness" className="hover:text-blue-400 transition-colors">
                  Sports & Fitness
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Demo */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Demo Credentials</h4>
            <div className="bg-slate-800/80 p-4 rounded-xl text-xs space-y-1.5 border border-slate-700/60">
              <p className="font-semibold text-slate-200">Admin Account:</p>
              <p className="text-slate-400">admin@ecommerce.com / Admin@123456</p>
              <div className="border-t border-slate-700/60 my-2" />
              <p className="font-semibold text-slate-200">Customer Account:</p>
              <p className="text-slate-400">john@example.com / User@123456</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ShopVista E-Commerce Platform. All rights reserved.</p>
          <p className="text-slate-500">Built with React, Express, PostgreSQL & Razorpay</p>
        </div>
      </div>
    </footer>
  );
};
