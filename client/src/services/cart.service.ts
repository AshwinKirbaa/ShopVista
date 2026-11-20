import api from './api';
import { ApiResponse, Cart } from '../types';

export const cartService = {
  async getCart() {
    const res = await api.get<ApiResponse<Cart>>('/cart');
    return res.data;
  },

  async addItem(productId: string, quantity = 1) {
    const res = await api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return res.data;
  },

  async updateItem(cartItemId: string, quantity: number) {
    const res = await api.put<ApiResponse<Cart>>(`/cart/items/${cartItemId}`, { quantity });
    return res.data;
  },

  async removeItem(cartItemId: string) {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${cartItemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await api.delete<ApiResponse<null>>('/cart');
    return res.data;
  },
};
