import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },
  forgotPassword: async (data) => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data;
  },
  resetPassword: async (data) => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },
};
