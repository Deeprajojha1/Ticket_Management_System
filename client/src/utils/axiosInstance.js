import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest = null;
let authRefreshEnabled = true;

export const setAuthRefreshEnabled = (enabled) => {
  authRefreshEnabled = enabled;
  if (!enabled) refreshRequest = null;
};

const notifyAuthExpired = () => {
  window.dispatchEvent(new CustomEvent("supportdesk:auth-expired"));
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    if (
      !authRefreshEnabled ||
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ||= axiosInstance.post("/auth/refresh-token");
      await refreshRequest;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (refreshError.response?.status === 401) {
        notifyAuthExpired();
      }
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  },
);

export default axiosInstance;
