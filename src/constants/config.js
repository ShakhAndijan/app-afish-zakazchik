export const API_BASE_URL = 'http://10.240.8.109:9494';

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google/login`,
  REGISTER_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/customer/register/request-otp`,
  REGISTER_UPLOAD_URL: `${API_BASE_URL}/api/v1/auth/customer/register/upload-url`,
  REGISTER_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/customer/register/verify-otp`,
  CATEGORIES: `${API_BASE_URL}/api/v1/categories`,
  WORKERS: `${API_BASE_URL}/api/v1/workers`,
  SYSTEM_STATS: `${API_BASE_URL}/api/v1/system/stats`,
};
// https://engraver-garnet-scalded.ngrok-free.dev
