import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters } from '../components/product/ProductFilters';
import { Pagination } from '../components/ui/Pagination';
import { SlidersHorizontal } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read URL params
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand = searchParams.get('brand') || '';
  const minRating = searchParams.get('minRating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          search: search || undefined,
          categoryId: categoryId || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          brand: brand || undefined,
          minRating: minRating ? Number(minRating) : undefined,
          sort,
          page,
          limit: 12,
        });

        if (res.success) {
          setProducts(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
            setTotalCount(res.pagination.total);
          }
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [search, categoryId, minPrice, maxPrice, brand, minRating, sort, page]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset to page 1 on filter changes
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-8 border-b border-[#ded8cb] gap-4">
        <div>
          <span className="text-xs font-mono-code tracking-widest text-[#7a6a58] uppercase">
            // shopvista® SELECTION
          </span>
          <h1 className="font-syne text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#120a06] mt-1">
            {search ? `SEARCH: "${search}"` : 'FULL HARDWARE CATALOG'}
          </h1>
          <p className="font-mono-code text-xs text-[#7a6a58] uppercase tracking-wider mt-1.5">
            Showing {products.length} of {totalCount} authentic high-performance items
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-[#ded8cb] bg-white rounded-xl text-xs font-mono-code text-[#120a06] shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{mobileFilterOpen ? 'Hide Filters' : 'Filters'}</span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className={`lg:block ${mobileFilterOpen ? 'block mb-6' : 'hidden'}`}>
          <ProductFilters
            categories={categories}
            selectedCategory={categoryId}
            onSelectCategory={(cat) => updateFilters({ category: cat || null })}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => updateFilters({ minPrice: min || null, maxPrice: max || null })}
            selectedBrand={brand}
            onSelectBrand={(b) => updateFilters({ brand: b || null })}
            minRating={minRating}
            onRatingChange={(r) => updateFilters({ minRating: r || null })}
            sortBy={sort}
            onSortChange={(s) => updateFilters({ sort: s })}
            onReset={handleReset}
          />
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3 flex flex-col">
          <ProductGrid
            products={products}
            isLoading={loading}
            onClearFilters={handleReset}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateFilters({ page: String(p) })}
          />
        </div>
      </div>
    </div>
  );
};
