// Backend manzili .env dagi EXPO_PUBLIC_API_BASE_URL dan olinadi; berilmasa dev server ishlatiladi.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dev-back.afish.uz'
).replace(/\/+$/, '');

// Kalitlar .env faylidan olinadi (.env.example ga qarang). Backend tayyor bo'lgach geocoder serverga o'tadi.
export const YANDEX_MAPS_API_KEY = process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY ?? '';
export const YANDEX_GEOCODER_API_KEY = process.env.EXPO_PUBLIC_YANDEX_GEOCODER_API_KEY ?? '';

// Imkoniyat bayroqlari. Onlayn to'lov (ikkinchi versiya) qo'shilguncha hamyon balansi yashirin.
export const FEATURES = {
  walletBalance: false,
  // "Barcha xizmatlar" tepasidagi umumiy statistika: ma'lumotlar yetarli bo'lgach yoqiladi.
  overallStats: false,
};

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google/login`,
  CUSTOMER_LOGIN: `${API_BASE_URL}/api/v1/auth/customer/login`,
  AUTH_CUSTOMER_START: `${API_BASE_URL}/api/v1/auth/customer/start`,
  AUTH_CUSTOMER_VERIFY: `${API_BASE_URL}/api/v1/auth/customer/verify`,
  AUTH_CUSTOMER_COMPLETE: `${API_BASE_URL}/api/v1/auth/customer/complete`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  AUTH_SET_PASSWORD: `${API_BASE_URL}/api/v1/auth/set-password`,
  AUTH_CHANGE_PHONE_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/change-phone/request-otp`,
  AUTH_CHANGE_PHONE_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/change-phone/verify-otp`,
  RESET_PASSWORD_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/reset-password/request-otp`,
  RESET_PASSWORD_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/reset-password/verify-otp`,
  CATEGORIES: `${API_BASE_URL}/api/v1/categories`,

  GENDERS: `${API_BASE_URL}/api/v1/genders`,
  REGIONS: `${API_BASE_URL}/api/v1/regions`,
  DISTRICTS: (regionId) => `${API_BASE_URL}/api/v1/regions/${regionId}/districts`,
  WORKERS: `${API_BASE_URL}/api/v1/workers`,
  WORKER_DETAIL: (workerId) => `${API_BASE_URL}/api/v1/workers/${workerId}`,
  WORKER_LIKE: (workerId) => `${API_BASE_URL}/api/v1/workers/${workerId}/like`,
  WORKER_CERTIFICATES: (workerId, categoryId) =>
    categoryId
      ? `${API_BASE_URL}/api/v1/workers/${workerId}/certificates?category_id=${categoryId}`
      : `${API_BASE_URL}/api/v1/workers/${workerId}/certificates`,
  SYSTEM_STATS: `${API_BASE_URL}/api/v1/system/stats`,
  TOP_COMMENTS: (limit = 10) => `${API_BASE_URL}/api/v1/reviews/top-comments?limit=${limit}`,
  TOP_ORDERS: (limit = 10) => `${API_BASE_URL}/api/v1/reviews/top-orders?limit=${limit}`,
  CUSTOMER_ME: `${API_BASE_URL}/api/v1/customers/me`,
  CUSTOMER_FAVORITES: (page = 1, size = 10) =>
    `${API_BASE_URL}/api/v1/customers/me/favorites?page=${page}&size=${size}`,
  CUSTOMER_AVATAR_UPLOAD_URL: `${API_BASE_URL}/api/v1/customers/me/avatar/upload-url`,
  CUSTOMER_AVATAR_CONFIRM: `${API_BASE_URL}/api/v1/customers/me/avatar/confirm`,
  CUSTOMER_AVATAR: `${API_BASE_URL}/api/v1/customers/me/avatar`,
  ORDERS: `${API_BASE_URL}/api/v1/orders`,
  ORDER_UPLOAD_URL: `${API_BASE_URL}/api/v1/orders/upload-url`,
  MY_ORDERS: (limit = 100, offset = 0) =>
    `${API_BASE_URL}/api/v1/orders/me/customer?limit=${limit}&offset=${offset}`,
  PUBLIC_ORDER: (token) => `${API_BASE_URL}/api/v1/orders/public/${encodeURIComponent(token)}`,
  ORDER_DETAIL: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}`,
  ORDER_PAYMENT: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/payment`,
  ORDER_CHAT: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/chat`,
  ORDER_CHAT_READ: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/chat/read`,
  ORDER_OFFER: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/offer`,
  ORDER_AGREE: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/agree`,
  ORDER_CANCEL: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/cancel-by-customer`,
};
// https://engraver-garnet-scalded.ngrok-free.dev
// http://10.240.8.109:9494
