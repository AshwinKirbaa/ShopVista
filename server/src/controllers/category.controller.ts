import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';

const generateCategorySlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      isActive: cat.isActive,
      productCount: cat._count.products,
      createdAt: cat.createdAt,
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    console.error('getCategories error:', error);
    return sendError(res, 'Failed to fetch categories', 500);
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        products: {
          where: { isActive: true },
          take: 12,
        },
      },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, category);
  } catch (error: any) {
    console.error('getCategoryById error:', error);
    return sendError(res, 'Failed to fetch category', 500);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, isActive = true } = req.body;
    const slug = generateCategorySlug(name);

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return sendError(res, 'Category with this name already exists', 409);
    }

    const category = await prisma.category.create({
      data: { name, slug, description, image, isActive },
    });

    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error: any) {
    console.error('createCategory error:', error);
    return sendError(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, description, image, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Category not found', 404);
    }

    const data: any = {
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(isActive !== undefined && { isActive }),
    };

    if (name && name !== existing.name) {
      data.name = name;
      data.slug = generateCategorySlug(name);
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return sendSuccess(res, updated, 'Category updated successfully');
  } catch (error: any) {
    console.error('updateCategory error:', error);
    return sendError(res, 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return sendError(
        res,
        `Cannot delete category. There are ${productsCount} products associated with it. Reassign or remove them first.`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error: any) {
    console.error('deleteCategory error:', error);
    return sendError(res, 'Failed to delete category', 500);
  }
};
