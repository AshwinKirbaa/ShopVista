import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featRes, newRes, catRes] = await Promise.all([
          productService.getProducts({ isFeatured: true, limit: 8 }),
          productService.getProducts({ sort: 'newest', limit: 8 }),
          categoryService.getCategories(),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.data);
        if (newRes.success) setNewArrivals(newRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 lg:py-28">
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Online Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Curated Luxury & <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                  Everyday Essentials
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Explore an authenticated collection of high-performance tech, luxury lifestyle goods, and premium apparel with express delivery and seamless Razorpay checkout.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link to="/products">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-600/30">
                    Explore Catalog <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/products?category=electronics-gadgets">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800">
                    Shop Electronics
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Genuine Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Lightning Fast Dispatch</span>
                </div>
              </div>
            </div>

            {/* Hero Graphic / Featured Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                    alt="Hero Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Featured Technology
                  </span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                    In Stock
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  AcousticPro ANC Headphones
                </h3>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-2xl font-extrabold text-white">₹12,999</span>
                    <span className="text-xs text-slate-400 line-through ml-2">₹17,999</span>
                  </div>
                  <Link to="/products/acousticpro-anc-wireless-headphones">
                    <Button size="sm" variant="primary">
                      View Deal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600">
              Browse Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Top Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group relative flex flex-col items-center bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all text-center"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-transform">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cat.productCount ? `${cat.productCount} items` : 'Explore'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>Staff Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Mid Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-extrabold tracking-widest uppercase bg-white/20 text-white px-3 py-1 rounded-full">
              Limited Offer
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold">
              Save Up to 40% on Premium Sound & Smart Gear
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Upgrade your setup today. High resolution audio, premium build materials, and next-day shipping guaranteed.
            </p>
            <div className="pt-2">
              <Link to="/products?category=electronics-gadgets">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-100 border-none font-bold">
                  Shop Deals Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600">
              Fresh Drops
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Join The Community
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Unlock 10% Off Your First Order
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Subscribe to receive exclusive drops, private members-only flash sales, and design inspiration directly to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to ShopVista!');
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" variant="primary">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};
