import api from './api';
import { ApiResponse, Category } from '../types';

export const categoryService = {
  async getCategories() {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  async getCategory(idOrSlug: string) {
    const res = await api.get<ApiResponse<Category>>(`/categories/${idOrSlug}`);
    return res.data;
  },

  async createCategory(data: Partial<Category>) {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data;
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return res.data;
  },
};
