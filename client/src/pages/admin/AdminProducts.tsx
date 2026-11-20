import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/product.service';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        search: search || undefined,
        page,
        limit: 10,
      });
      if (res.success) {
        setProducts(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteProductTarget) return;
    setIsDeleting(true);
    try {
      const res = await productService.deleteProduct(deleteProductTarget.id);
      if (res.success) {
        toast.success(res.message || 'Product removed successfully');
        setDeleteProductTarget(null);
        fetchProducts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Product Management</h1>
          <p className="text-sm text-slate-500">Manage catalog, pricing, and live inventory</p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter products by title or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Image & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 text-sm truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {prod.isFeatured ? '⭐ Featured Item' : 'Standard catalog'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-medium text-slate-600">{prod.sku}</td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {prod.category?.name || 'Unassigned'}
                    </td>

                    <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-md text-xs ${
                          prod.stock > 20
                            ? 'bg-emerald-50 text-emerald-700'
                            : prod.stock > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {prod.stock} in stock
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={prod.isActive ? 'success' : 'neutral'} size="sm">
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/products/${prod.slug}`}
                        target="_blank"
                        className="inline-flex p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View on site"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/products/edit/${prod.id}`}
                        className="inline-flex p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteProductTarget(prod)}
                        className="inline-flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteProductTarget}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteProductTarget?.name}"? If it has historical orders, it will be deactivated to preserve audit records.`}
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
