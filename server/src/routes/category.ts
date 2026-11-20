import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin endpoints
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate({ body: createCategorySchema }),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate({ body: updateCategorySchema }),
  updateCategory
);

router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;
