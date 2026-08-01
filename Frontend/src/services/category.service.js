import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const categoryService = {
  getAll: async (params) => {
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.DETAIL(id));
    return response.data;
  },
  createCategory: async (data) => {
    const response = await apiClient.post(ENDPOINTS.CATEGORIES.CREATE, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(ENDPOINTS.CATEGORIES.DELETE(id));
    return response.data;
  },
};
