export const API_BASE_URL = 'https://dev-back.afish.uz';

export const YANDEX_MAPS_API_KEY = 'e9e77baf-a133-46b1-9f59-055744b55c57';
export const YANDEX_GEOCODER_API_KEY = 'ca902206-f8b0-42a0-8ba2-9ae813f026d8';

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google/login`,
  CUSTOMER_LOGIN: `${API_BASE_URL}/api/v1/auth/customer/login`,
  AUTH_CUSTOMER_START: `${API_BASE_URL}/api/v1/auth/customer/start`,
  AUTH_CUSTOMER_VERIFY: `${API_BASE_URL}/api/v1/auth/customer/verify`,
  AUTH_CUSTOMER_COMPLETE: `${API_BASE_URL}/api/v1/auth/customer/complete`,
  AUTH_CUSTOMER_CLAIM: `${API_BASE_URL}/api/v1/auth/customer/claim`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  AUTH_SET_PASSWORD: `${API_BASE_URL}/api/v1/auth/set-password`,
  AUTH_CHANGE_PHONE_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/change-phone/request-otp`,
  AUTH_CHANGE_PHONE_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/change-phone/verify-otp`,
  RESET_PASSWORD_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/reset-password/request-otp`,
  RESET_PASSWORD_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/reset-password/verify-otp`,
  CATEGORIES: `${API_BASE_URL}/api/v1/categories`,

  GENDERS: `${API_BASE_URL}/api/v1/genders`,
  REGIONS: `${API_BASE_URL}/api/v1/regions`,
  DISTRICTS: (regionId) =>
    `${API_BASE_URL}/api/v1/regions/${regionId}/districts`,
  WORKERS: `${API_BASE_URL}/api/v1/workers`,
  WORKER_DETAIL: (workerId) => `${API_BASE_URL}/api/v1/workers/${workerId}`,
  WORKER_LIKE: (workerId) => `${API_BASE_URL}/api/v1/workers/${workerId}/like`,
  WORKER_CERTIFICATES: (workerId, categoryId) =>
    categoryId
      ? `${API_BASE_URL}/api/v1/workers/${workerId}/certificates?category_id=${categoryId}`
      : `${API_BASE_URL}/api/v1/workers/${workerId}/certificates`,
  LISTINGS: (limit = 10, offset = 0) =>
    `${API_BASE_URL}/api/v1/listings?limit=${limit}&offset=${offset}`,
  SYSTEM_STATS: `${API_BASE_URL}/api/v1/system/stats`,
  TOP_COMMENTS: (limit = 10) =>
    `${API_BASE_URL}/api/v1/reviews/top-comments?limit=${limit}`,
  TOP_ORDERS: (limit = 10) =>
    `${API_BASE_URL}/api/v1/reviews/top-orders?limit=${limit}`,
  CUSTOMER_ME: `${API_BASE_URL}/api/v1/customers/me`,
  CUSTOMER_FAVORITES: (page = 1, size = 10) =>
    `${API_BASE_URL}/api/v1/customers/me/favorites?page=${page}&size=${size}`,
  CUSTOMER_AVATAR_UPLOAD_URL: `${API_BASE_URL}/api/v1/customers/me/avatar/upload-url`,
  CUSTOMER_AVATAR_CONFIRM: `${API_BASE_URL}/api/v1/customers/me/avatar/confirm`,
  CUSTOMER_AVATAR: `${API_BASE_URL}/api/v1/customers/me/avatar`,
  ORDERS: `${API_BASE_URL}/api/v1/orders`,
};
// https://engraver-garnet-scalded.ngrok-free.dev
// http://10.240.8.109:9494
