import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Category } from '../../types';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(2, 'SKU is required'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  imageUrl: z.string().url('Must be a valid image URL'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });

    if (isEditing) {
      productService.getProduct(id).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setValue('name', p.name);
          setValue('description', p.description);
          setValue('price', p.price);
          setValue('comparePrice', p.comparePrice);
          setValue('sku', p.sku);
          setValue('stock', p.stock);
          setValue('imageUrl', p.images[0] || '');
          setValue('categoryId', p.categoryId);
          setValue('isActive', p.isActive);
          setValue('isFeatured', p.isFeatured);
        }
      });
    }
  }, [id, isEditing, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        images: [data.imageUrl],
      };

      if (isEditing) {
        await productService.updateProduct(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEditing ? 'Modify product metadata and live stock' : 'Add an item to the online catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8 space-y-6">
        <Input
          label="Product Name"
          placeholder="e.g. Wireless ANC Headphones"
          error={errors.name?.message as string}
          {...register('name')}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Full Description
          </label>
          <textarea
            rows={4}
            placeholder="Detailed features, specifications, and materials..."
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Selling Price (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 12999"
            error={errors.price?.message as string}
            {...register('price')}
          />
          <Input
            label="Compare Price / MRP (₹)"
            type="number"
            step="0.01"
            placeholder="Higher than selling price"
            error={errors.comparePrice?.message as string}
            {...register('comparePrice')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Stock Keeping Unit (SKU)"
            placeholder="e.g. ELEC-001"
            error={errors.sku?.message as string}
            {...register('sku')}
          />
          <Input
            label="Available Stock Units"
            type="number"
            placeholder="e.g. 50"
            error={errors.stock?.message as string}
            {...register('stock')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
          <select
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
            {...register('categoryId')}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.categoryId.message as string}</p>
          )}
        </div>

        <Input
          label="Primary Image URL"
          placeholder="https://images.unsplash.com/..."
          error={errors.imageUrl?.message as string}
          {...register('imageUrl')}
        />

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" {...register('isActive')} />
            <span>Active in Store</span>
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" {...register('isFeatured')} />
            <span>Feature on Home Page</span>
          </label>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link to="/admin/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={isLoading} icon={<Save className="w-4 h-4" />}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};
