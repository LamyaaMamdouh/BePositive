// ─────────────────────────────────────────────────────────────
// API Base Configuration
// BePositive — Blood Donation Platform
// ─────────────────────────────────────────────────────────────

/**
 * The root URL for all API requests.
 * Every apiClient call will be prefixed with this base URL.
 */
export const API_BASE_URL = "https://bepositive.runasp.net";

/**
 * Global request timeout in milliseconds.
 * Requests exceeding this duration will be automatically aborted.
 */
export const API_TIMEOUT_MS = 10_000;

/**
 * Default headers attached to every outgoing request.
 * The Authorization header is injected dynamically by the request interceptor.
 */
export const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * Local-storage keys used to persist authentication tokens.
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/**
 * Auth-related endpoint paths (used inside interceptors only).
 * Full endpoint definitions live in endpoints.ts.
 */
export const REFRESH_TOKEN_PATH = "/api/auth/refresh";