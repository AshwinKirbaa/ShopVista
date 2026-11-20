import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/product.service';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProduct(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(res.data.images[0] || '');

          // Fetch related in same category
          if (res.data.categoryId) {
            const relRes = await productService.getProducts({
              categoryId: res.data.categoryId,
              limit: 4,
            });
            if (relRes.success) {
              setRelatedProducts(relRes.data.filter((p) => p.id !== res.data.id));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/4 h-8" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products">
          <Button variant="primary">Browse All Products</Button>
        </Link>
      </div>
    );
  }

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm p-4 flex items-center justify-center">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {product.category?.name || 'Category'}
            </span>
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <span>{Number(product.rating || 4.8).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount || 42} reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Price Block */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold bg-rose-600 text-white px-2.5 py-1 rounded-lg">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stock Indicator */}
          <div>
            {product.stock > 10 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock} units available)
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold">
                Only {product.stock} units remaining in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            {product.description}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-slate-300 rounded-xl bg-white px-3 py-2 w-32 justify-between">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              size="lg"
              variant="primary"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product, quantity)}
              className="flex-1 shadow-lg shadow-blue-600/20"
              icon={<ShoppingCart className="w-5 h-5" />}
            >
              Add To Shopping Cart
            </Button>
          </div>

          {/* Assurance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free Delivery &gt; ₹500</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authentic Product</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>7-Day Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900">Related Products</h3>
            <Link
              to={`/products?category=${product.categoryId}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              See all in this category &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
