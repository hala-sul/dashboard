import axios from "axios";

const api = axios.create({
  baseURL: "https://srv1701447.hstgr.cloud/weesty",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// للـ debugging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("🚀 الطلب:", config.method, config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log("✅ الرد:", response.status, response.data);
    return response;
  },
  error => {
    console.error("❌ خطأ:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;