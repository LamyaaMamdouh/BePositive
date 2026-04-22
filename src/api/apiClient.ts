// ─────────────────────────────────────────────────────────────
// Axios Instance — Single shared HTTP client
// BePositive — Blood Donation Platform
// ─────────────────────────────────────────────────────────────

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  DEFAULT_HEADERS,
  TOKEN_KEYS,
  REFRESH_TOKEN_PATH,
} from "./api.config";

// ─── Token helpers ────────────────────────────────────────────
// These check both localStorage (persistent) and sessionStorage (session-only)

const getAccessToken = (): string | null =>
  localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) ||
  sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);

const getRefreshToken = (): string | null =>
  localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN) ||
  sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

const clearTokens = (): void => {
  // Clear from both storages to ensure complete logout
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
};

const setAccessToken = (token: string): void => {
  // Determine which storage to use based on existing token location
  if (localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)) {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  } else if (sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)) {
    sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  } else {
    // Fallback: use localStorage if neither exists
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  }
};

// ─── Redirect helper ─────────────────────────────────────────

const redirectToLogin = (): void => {
  // Only redirect if not already on the login page to avoid loops
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/org/login";
  }
};

// ─── Toast helper (graceful — works even if sonner isn't imported) ──

const showErrorToast = (message: string): void => {
  // Dynamically dispatch a custom event so any mounted <Toaster />
  // can pick it up, keeping this file free of React dependencies.
  window.dispatchEvent(
    new CustomEvent("api:error", { detail: { message } }),
  );
};

// ─── Refresh-token logic ──────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const attemptTokenRefresh = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken)
    throw new Error("No refresh token available");

  // Use a plain axios call (not the shared instance) to avoid interceptor loops
  const response = await axios.post(
    `${API_BASE_URL}${REFRESH_TOKEN_PATH}`,
    { refreshToken },
    { headers: DEFAULT_HEADERS },
  );

  const newAccessToken: string =
    response.data?.accessToken ?? response.data?.access_token;
  if (!newAccessToken)
    throw new Error("Refresh response missing access token");

  setAccessToken(newAccessToken);
  return newAccessToken;
};

// ─── Create Axios instance ────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: DEFAULT_HEADERS,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────
// Attaches the Bearer token to every outgoing request if one exists.

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────
// Handles 401, 403, and 500 globally for every response.

apiClient.interceptors.response.use(
  // ✅ Successful response — pass through untouched
  (response) => response,

  // ❌ Error response — handle by status code
  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
    const status = error.response?.status;

    // ── 401 · Token expired or invalid ───────────────────────
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests that arrive while a refresh is already in-flight
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] =
                `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
          // Reject after a safety timeout to avoid indefinite queuing
          setTimeout(() => reject(error), API_TIMEOUT_MS);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await attemptTokenRefresh();
        onTokenRefreshed(newToken);
        isRefreshing = false;

        // Retry the original request with the fresh token
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] =
            `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — sign the user out
        isRefreshing = false;
        clearTokens();
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    // ── 403 · Forbidden ──────────────────────────────────────
    if (status === 403) {
      showErrorToast(
        "You don't have permission to perform this action.",
      );
      return Promise.reject(error);
    }

    // ── 500 · Internal server error ──────────────────────────
    if (status === 500) {
      showErrorToast(
        "Something went wrong. Please try again later.",
      );
      return Promise.reject(error);
    }

    // All other errors — propagate as-is
    return Promise.reject(error);
  },
);

export default apiClient;