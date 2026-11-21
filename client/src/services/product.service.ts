import api from './api';
import { ApiResponse, Product } from '../types';

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string;
  sort?: string;
  page?: number;
  limit?: number;
  isFeatured?: boolean;
}

export const productService = {
  async getProducts(params?: ProductQueryParams) {
    const res = await api.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },

  async getProduct(idOrSlug: string) {
    const res = await api.get<ApiResponse<Product>>(`/products/${idOrSlug}`);
    return res.data;
  },

  async createProduct(data: Partial<Product>) {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return res.data;
  },
};
