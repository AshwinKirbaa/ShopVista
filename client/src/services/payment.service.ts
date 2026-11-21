import api from './api';
import { ApiResponse } from '../types';

export interface CheckoutData {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  notes?: string;
  paymentMethod: 'RAZORPAY' | 'COD';
}

export interface PaymentOrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  isOfficialGatewayAvailable?: boolean;
  paymentMethod?: string;
  customer?: {
    name: string;
    email: string;
    contact: string;
  };
}

export const paymentService = {
  async createPaymentOrder(data: CheckoutData) {
    const res = await api.post<ApiResponse<PaymentOrderResponse>>('/payments/create-order', data);
    return res.data;
  },

  async verifyPayment(verificationData: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const res = await api.post<ApiResponse<{ orderId: string; orderNumber: string }>>(
      '/payments/verify',
      verificationData
    );
    return res.data;
  },
};
