import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';
import { fetchFlipkartLive, parseFlipkartLiveHtml } from '../services/comparison/flipkartLiveScraper';
import { SemanticSearchEngine } from '../services/SemanticSearchEngine';

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
      category,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      isFeatured,
    } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Normalize category parameter: accept categoryId or category, and match by UUID or slug
    const targetCategory = categoryId || category;
    let resolvedCategoryId: string | undefined = undefined;
    if (targetCategory) {
      const catStr = String(targetCategory).trim();
      const matchedCat = await prisma.category.findFirst({
        where: {
          OR: [{ id: catStr }, { slug: catStr }],
        },
      });
      if (matchedCat) {
        resolvedCategoryId = matchedCat.id;
      } else {
        resolvedCategoryId = catStr;
      }
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
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

    let [total, products] = await Promise.all([
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

    // 2. SEMANTIC SEARCH & RE-RANKING:
    // If a search query is provided, evaluate candidate products using semantic concepts,
    // synonyms (e.g. "phone" -> iPhone, Galaxy; "laptop" -> MacBook), and stem relevance.
    if (search && String(search).trim().length >= 2) {
      const queryStr = String(search).trim();

      // Retrieve all active candidate products to perform semantic matching
      const candidates = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
          ...(isFeatured !== undefined && { isFeatured: String(isFeatured) === 'true' }),
          ...((minPrice || maxPrice) && {
            price: {
              ...(minPrice ? { gte: new Prisma.Decimal(Number(minPrice)) } : {}),
              ...(maxPrice ? { lte: new Prisma.Decimal(Number(maxPrice)) } : {}),
            },
          }),
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      const semanticRanked = SemanticSearchEngine.rankProducts(queryStr, candidates, 0.15);

      if (semanticRanked.length > 0) {
        total = semanticRanked.length;
        products = semanticRanked.slice(skip, skip + take).map((r) => r.item);
      } else {
        // Fallback: If no products in DB match semantically, fetch live Flipkart on-demand
        try {
          const liveHtml = await fetchFlipkartLive(queryStr);
          const liveItems = parseFlipkartLiveHtml(liveHtml);

          if (liveItems && liveItems.length > 0) {
            let category = await prisma.category.findFirst({
              where: { slug: 'electronics-audio' },
            });
            if (!category) {
              category = await prisma.category.findFirst();
            }

            if (category) {
              for (const item of liveItems.slice(0, 8)) {
                const cleanSlug = item.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '')
                  .slice(0, 80) + `-${item.id.slice(-6).toLowerCase()}`;

                const existing = await prisma.product.findFirst({
                  where: { OR: [{ sku: `LIVE-FK-${item.id}` }, { slug: cleanSlug }] },
                });

                if (!existing) {
                  await prisma.product.create({
                    data: {
                      name: item.title,
                      slug: cleanSlug,
                      description: `Authentic ${item.title} with live pricing of ₹${item.sellingPrice.toLocaleString('en-IN')}. Features genuine factory specifications and verified listing on Flipkart India.`,
                      price: new Prisma.Decimal(item.sellingPrice.toString()),
                      comparePrice: new Prisma.Decimal(item.mrp.toString()),
                      sku: `LIVE-FK-${item.id}`,
                      stock: 25,
                      images: [item.imageUrl],
                      categoryId: category.id,
                      isFeatured: true,
                      rating: new Prisma.Decimal((item.rating || 4.5).toFixed(1)),
                      reviewCount: Math.floor(Math.random() * 200) + 40,
                      isActive: true,
                    },
                  });
                }
              }

              // Re-run semantic search after ingestion
              const freshCandidates = await prisma.product.findMany({
                where: { isActive: true },
                include: {
                  category: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              });

              const reRanked = SemanticSearchEngine.rankProducts(queryStr, freshCandidates, 0.15);
              if (reRanked.length > 0) {
                total = reRanked.length;
                products = reRanked.slice(skip, skip + take).map((r) => r.item);
              }
            }
          }
        } catch (fetchErr: any) {
          console.warn('Semantic on-demand fetch failed:', fetchErr.message);
        }
      }
    }

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
