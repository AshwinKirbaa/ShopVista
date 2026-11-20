import { Router } from 'express';
import {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getCustomers,
  getCustomerDetail,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { updateOrderStatusSchema } from '../validators/order';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', validate({ body: updateOrderStatusSchema }), updateOrderStatus);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetail);

export default router;
