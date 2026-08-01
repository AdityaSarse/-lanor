import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const brandService = {
  getAll: async (params) => {
    const response = await apiClient.get(ENDPOINTS.BRANDS.LIST, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.BRANDS.DETAIL(id));
    return response.data;
  },
  createBrand: async (data) => {
    const response = await apiClient.post(ENDPOINTS.BRANDS.CREATE, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(ENDPOINTS.BRANDS.UPDATE(id), data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(ENDPOINTS.BRANDS.DELETE(id));
    return response.data;
  },
};
