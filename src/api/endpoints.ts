// ─────────────────────────────────────────────────────────────
// API Endpoints Registry
// BePositive — Blood Donation Platform
//
// All endpoint paths are defined here and grouped by domain.
// Import this object wherever an API call is made, and reference
// the path via ENDPOINTS.<DOMAIN>.<ACTION> so that URL changes
// only ever need to happen in a single place.
//
// Example usage:
//   import ENDPOINTS from "@/api/endpoints";
//   apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
// ─────────────────────────────────────────────────────────────

const ENDPOINTS = {
  // ── Authentication ──────────────────────────────────────────
  AUTH: {
    HOSPITAL_REGISTER: "/api/auth/hospital/register",
    HOSPITAL_LOGIN: "/api/Auth/HospitalAdminlogin",
    REFRESH: "/api/auth/refresh",
    VERIFY_EMAIL: "/api/Auth/email/verify",
    FORGOT_PASSWORD: "/api/Auth/password/forgot",
    VERIFY_RESET_OTP: "/api/Auth/password/verifyotp",
    RESET_PASSWORD: "/api/Auth/password/reset",
    RESEND_RESET_OTP: "/api/Auth/password/resend-otp",
  },

  // ── Locations (cities, governorates, etc.) ──────────────────
  LOCATIONS: {
    GOVERNORATES: "/api/locations/governorates",
    CITIES_BY_GOV: (governorateId: string) =>
      `/api/locations/governorates/${governorateId}/cities`,
    CITIES_SEARCH: "/api/locations/cities/search",
    BLOOD_TYPES: "/api/locations/blood-types",
  },

  // ── Hospital / Organization Portal ──────────────────────────
  HOSPITAL: {
    CREATE_REQUEST: "/api/hospital/requests",
    GET_REQUESTS: "/api/hospital/requests",
    GET_REQUEST: (id: string) => `/api/hospital/requests/${id}`,
    UPDATE_REQUEST: (id: string) => `/api/hospital/requests/${id}`,
    CANCEL_REQUEST: (id: string) => `/api/hospital/requests/${id}/cancel`,
    DONOR_STATS: "/api/hospital/donors/stats",
    DONORS: "/api/hospital/donors",
    DONOR_DETAIL: (donorId: string) => `/api/hospital/donors/${donorId}`,
    INVENTORY: "/api/hospital/inventory",
    INVENTORY_BY_TYPE: (bloodTypeId: string) => `/api/hospital/inventory/${bloodTypeId}`,
    INVENTORY_ADD_BATCH: "/api/hospital/inventory/batches/add",
    INVENTORY_WITHDRAW: "/api/hospital/inventory/withdraw",
    INVENTORY_EXPIRING: "/api/hospital/inventory/expiring-soon",
    INVENTORY_TRANSACTIONS: "/api/hospital/inventory/transactions",
    INVENTORY_COMPATIBLE: (bloodTypeId: string) => `/api/hospital/inventory/compatible/${bloodTypeId}`,
    DASHBOARD_STATS: "/api/hospital/dashboard/stats",
    DASHBOARD_RECENT_ACTIVITY: "/api/hospital/dashboard/recent-activity",
    DASHBOARD_ACTIVITY_LOG: "/api/hospital/dashboard/activity-log",
    ANALYTICS_SUMMARY: (period: string) =>
      `/api/hospital/analytics/summary?period=${period}`,
    ANALYTICS_TRENDS: (period: string) =>
      `/api/hospital/analytics/trends?period=${period}`,
    ANALYTICS_DISTRIBUTION: (period: string) =>
      `/api/hospital/analytics/blood-type-distribution?period=${period}`,
    PROFILE: "/api/hospital/profile",
    UPDATE_PROFILE: "/api/hospital/profile",
  },

  // ── Donor Management ───────────────────────────────────────
  DONOR: {
    // e.g. LIST:    "/api/donors",
    // e.g. DETAIL:  (id: number) => `/api/donors/${id}`,
    // e.g. SEARCH:  "/api/donors/search",
  },

  // ── Admin ────────────────────────────────────────────────────
  ADMIN: {
    // e.g. USERS:   "/api/admin/users",
    // e.g. REPORTS: "/api/admin/reports",
  },
} as const;

export default ENDPOINTS;