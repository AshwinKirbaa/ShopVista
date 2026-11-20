import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validators/cart';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate({ body: addToCartSchema }), addItemToCart);
router.put('/items/:id', validate({ body: updateCartItemSchema }), updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

export default router;
