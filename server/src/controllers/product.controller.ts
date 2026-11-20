import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';

const generateSlug = (name: string): string => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 7)
  );
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      isFeatured,
    } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(categoryId && { categoryId: String(categoryId) }),
      ...(isFeatured !== undefined && { isFeatured: String(isFeatured) === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice ? { gte: new Prisma.Decimal(Number(minPrice)) } : {}),
          ...(maxPrice ? { lte: new Prisma.Decimal(Number(maxPrice)) } : {}),
        },
      }),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };
    if (sort === 'popular') orderBy = { reviewCount: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
      comparePrice: p.comparePrice ? p.comparePrice.toNumber() : null,
      rating: p.rating.toNumber(),
    }));

    return sendSuccess(res, formattedProducts, undefined, 200, {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error: any) {
    console.error('getProducts error:', error);
    return sendError(res, 'Failed to fetch products', 500);
  }
};

export const getProductByIdOrSlug = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const formatted = {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
      rating: product.rating.toNumber(),
    };

    return sendSuccess(res, formatted);
  } catch (error: any) {
    console.error('getProduct error:', error);
    return sendError(res, 'Failed to fetch product details', 500);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      stock,
      images,
      categoryId,
      isActive = true,
      isFeatured = false,
    } = req.body;

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return sendError(res, 'SKU already exists', 409);
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return sendError(res, 'Invalid category ID', 400);
    }

    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: new Prisma.Decimal(price),
        comparePrice: comparePrice ? new Prisma.Decimal(comparePrice) : null,
        sku,
        stock,
        images,
        categoryId,
        isActive,
        isFeatured,
      },
      include: { category: true },
    });

    return sendSuccess(
      res,
      {
        ...product,
        price: product.price.toNumber(),
        comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
        rating: product.rating.toNumber(),
      },
      'Product created successfully',
      201
    );
  } catch (error: any) {
    console.error('createProduct error:', error);
    return sendError(res, 'Failed to create product', 500);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      stock,
      images,
      categoryId,
      isActive,
      isFeatured,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return sendError(res, 'Product not found', 404);
    }

    if (sku && sku !== existingProduct.sku) {
      const skuCheck = await prisma.product.findUnique({ where: { sku } });
      if (skuCheck) return sendError(res, 'SKU already in use', 409);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
        ...(comparePrice !== undefined && {
          comparePrice: comparePrice ? new Prisma.Decimal(comparePrice) : null,
        }),
        ...(sku && { sku }),
        ...(stock !== undefined && { stock }),
        ...(images && { images }),
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: { category: true },
    });

    return sendSuccess(
      res,
      {
        ...updated,
        price: updated.price.toNumber(),
        comparePrice: updated.comparePrice ? updated.comparePrice.toNumber() : null,
        rating: updated.rating.toNumber(),
      },
      'Product updated successfully'
    );
  } catch (error: any) {
    console.error('updateProduct error:', error);
    return sendError(res, 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.orderItems.length > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return sendSuccess(res, null, 'Product deactivated (historical order preserved)');
    }

    await prisma.product.delete({ where: { id } });
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error: any) {
    console.error('deleteProduct error:', error);
    return sendError(res, 'Failed to delete product', 500);
  }
};
