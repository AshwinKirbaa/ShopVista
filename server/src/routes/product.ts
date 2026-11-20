import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product';

const router = Router();

router.get('/', validate({ query: productQuerySchema }), getProducts);
router.get('/:id', getProductByIdOrSlug);

// Admin-only endpoints
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate({ body: createProductSchema }),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate({ body: updateProductSchema }),
  updateProduct
);

router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
