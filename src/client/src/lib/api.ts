import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

import { env } from "@/env";
import { authStorage } from "@/lib/auth-storage";
import { DEFAULT_LOCALE, LOCALE_TAGS, type LocaleCode } from "@/constants/i18n.constants";

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

// Request interceptor - inject access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach current client locale as Accept-Language so backend can return localized content
  try {
    if (typeof window !== "undefined") {
      const docLang = document.documentElement.lang;
      const short = docLang ? docLang.split("-")[0] : DEFAULT_LOCALE;
      const tag = LOCALE_TAGS[short as LocaleCode] ?? LOCALE_TAGS[DEFAULT_LOCALE];
      config.headers["Accept-Language"] = tag;
    } else {
      config.headers["Accept-Language"] = LOCALE_TAGS[DEFAULT_LOCALE];
    }
  } catch {
    config.headers["Accept-Language"] = LOCALE_TAGS[DEFAULT_LOCALE];
  }
  return config;
});

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Don't intercept auth endpoints — 401 here means bad credentials, not expired token
    const isAuthEndpoint = originalRequest?.url?.startsWith("/auth/");
    if (isAuthEndpoint) {
      return Promise.reject(err);
    }

    // If 401 and not already retrying, try to refresh token
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data.data;
          authStorage.setAccessToken(accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, clear auth and redirect to login
          authStorage.clearAll();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } else {
        authStorage.clearAll();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    if (axios.isAxiosError(err)) return Promise.reject(err);
    return Promise.reject(new AxiosError("Lỗi không xác định"));
  }
);

type Cfg = AxiosRequestConfig & { signal?: AbortSignal };

export const get = async <T>(url: string, config?: Cfg) => (await api.get<T>(url, config)).data;

export const post = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
  (await api.post<T>(url, body, config)).data;

export const put = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
  (await api.put<T>(url, body, config)).data;

export const del = async <T>(url: string, config?: Cfg) => (await api.delete<T>(url, config)).data;
