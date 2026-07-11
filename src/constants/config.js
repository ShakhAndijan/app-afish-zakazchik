export const API_BASE_URL = 'http://10.240.8.109:9494';

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google/login`,
  REGISTER_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/customer/register/request-otp`,
  REGISTER_UPLOAD_URL: `${API_BASE_URL}/api/v1/auth/customer/register/upload-url`,
  REGISTER_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/customer/register/verify-otp`,
  CUSTOMER_LOGIN: `${API_BASE_URL}/api/v1/auth/customer/login`,
  LOGIN_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/customer/login/request-otp`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  RESET_PASSWORD_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/reset-password/request-otp`,
  RESET_PASSWORD_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/reset-password/verify-otp`,
  CATEGORIES: `${API_BASE_URL}/api/v1/categories`,
  // NOTE: WORKERS, SYSTEM_STATS below are best-guess REST conventions, not yet
  // confirmed against the real backend — update if the actual paths differ.
  // GENDERS, REGIONS, and DISTRICTS are confirmed.
  GENDERS: `${API_BASE_URL}/api/v1/genders`,
  REGIONS: `${API_BASE_URL}/api/v1/regions`,
  DISTRICTS: (regionId) => `${API_BASE_URL}/api/v1/regions/${regionId}/districts`,
  WORKERS: `${API_BASE_URL}/api/v1/workers`,
  SYSTEM_STATS: `${API_BASE_URL}/api/v1/system/stats`,
  TOP_COMMENTS: (limit = 10) => `${API_BASE_URL}/api/v1/reviews/top-comments?limit=${limit}`,
  TOP_ORDERS: (limit = 10) => `${API_BASE_URL}/api/v1/reviews/top-orders?limit=${limit}`,
  CUSTOMER_FAVORITES: (page = 1, size = 10) =>
    `${API_BASE_URL}/api/v1/customers/me/favorites?page=${page}&size=${size}`,
  CUSTOMER_AVATAR_UPLOAD_URL: `${API_BASE_URL}/api/v1/customers/me/avatar/upload-url`,
  CUSTOMER_AVATAR_CONFIRM: `${API_BASE_URL}/api/v1/customers/me/avatar/confirm`,
};
// https://engraver-garnet-scalded.ngrok-free.dev
