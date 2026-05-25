import axios from "axios";

let accessToken: string | null = null;

export const setToken = (token: string) => { accessToken = token; };
export const clearToken = () => { accessToken = null; };
export const getToken = () => accessToken;

// Baked in at Vercel build time — set NEXT_PUBLIC_API_URL=https://share-47cf.onrender.com
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;