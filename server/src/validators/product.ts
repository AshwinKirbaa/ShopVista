import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  comparePrice: z.number().positive().optional().nullable(),
  sku: z.string().min(2, 'SKU is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least one image is required'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  brand: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'rating']).optional().default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(12),
  isFeatured: z.coerce.boolean().optional(),
});
