import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema, verifyPaymentSchema } from '../validators/order';

const router = Router();

// Webhook endpoint (public with signature header verification)
router.post('/webhook', handleWebhook);

// Protected payment endpoints
router.post(
  '/create-order',
  authenticate,
  validate({ body: checkoutSchema }),
  createRazorpayOrder
);

router.post(
  '/verify',
  authenticate,
  validate({ body: verifyPaymentSchema }),
  verifyPayment
);

export default router;
