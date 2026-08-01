import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const couponService = {
  getAll: async (params) => {
    const response = await apiClient.get(ENDPOINTS.COUPONS.LIST, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.COUPONS.DETAIL(id));
    return response.data;
  },
  createCoupon: async (data) => {
    const response = await apiClient.post(ENDPOINTS.COUPONS.CREATE, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(ENDPOINTS.COUPONS.UPDATE(id), data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(ENDPOINTS.COUPONS.DELETE(id));
    return response.data;
  },
  validateCoupon: async (data) => {
    const response = await apiClient.post(ENDPOINTS.COUPONS.VALIDATE, data);
    return response.data;
  },
};
