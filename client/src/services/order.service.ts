import api from './api';
import { ApiResponse, Order } from '../types';

export const orderService = {
  async getOrders(page = 1, limit = 10) {
    const res = await api.get<ApiResponse<Order[]>>('/orders', { params: { page, limit } });
    return res.data;
  },

  async getOrder(id: string) {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id: string, reason?: string) {
    const res = await api.post<ApiResponse<null>>(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
};
