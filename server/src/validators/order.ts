import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'Full name is required'),
  shippingPhone: z.string().min(10, 'Valid phone number is required'),
  shippingAddress: z.string().min(5, 'Address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingState: z.string().min(2, 'State is required'),
  shippingPincode: z.string().min(4, 'Postal code is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD']).default('RAZORPAY'),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().optional(),
});
