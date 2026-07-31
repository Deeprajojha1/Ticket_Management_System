import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    if (!originalRequest || status !== 401 || originalRequest._retry || url.includes("/auth/refresh-token") || url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ||= axiosInstance.post("/auth/refresh-token");
      await refreshRequest;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  },
);

export default axiosInstance;
