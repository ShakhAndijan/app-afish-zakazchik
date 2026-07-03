export const API_BASE_URL = 'https://engraver-garnet-scalded.ngrok-free.dev';

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN:        `${API_BASE_URL}/api/v1/auth/google/login`,
  REGISTER_REQUEST_OTP:     `${API_BASE_URL}/api/v1/auth/customer/register/request-otp`,
  REGISTER_UPLOAD_URL:      `${API_BASE_URL}/api/v1/auth/customer/register/upload-url`,
  CATEGORIES:               `${API_BASE_URL}/api/v1/categories`,
  WORKERS:                  `${API_BASE_URL}/api/v1/workers`,
  SYSTEM_STATS:             `${API_BASE_URL}/api/v1/system/stats`,
};
