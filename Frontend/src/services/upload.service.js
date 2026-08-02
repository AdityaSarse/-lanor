import apiClient from "../utils/axios";
import { ENDPOINTS } from "../constants/api.constants";

export const uploadService = {
  uploadSingle: async (file, folder = "/products") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await apiClient.post(ENDPOINTS.UPLOAD.SINGLE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
  uploadMultiple: async (files, folder = "/products") => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });
    formData.append("folder", folder);

    const response = await apiClient.post(ENDPOINTS.UPLOAD.MULTIPLE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
