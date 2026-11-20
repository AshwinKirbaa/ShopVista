import api from './api';
import { ApiResponse, DashboardStats, Order, User } from '../types';

export const adminService = {
  async getDashboard() {
    const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return res.data;
  },

  async getOrders(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<Order[]>>('/admin/orders', { params });
    return res.data;
  },

  async updateOrderStatus(id: string, status: string, note?: string) {
    const res = await api.patch<ApiResponse<null>>(`/admin/orders/${id}/status`, { status, note });
    return res.data;
  },

  async getCustomers(params?: { search?: string; page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<User[]>>('/admin/customers', { params });
    return res.data;
  },

  async getCustomerDetail(id: string) {
    const res = await api.get<ApiResponse<any>>(`/admin/customers/${id}`);
    return res.data;
  },
};
