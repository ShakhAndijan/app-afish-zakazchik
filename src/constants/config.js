// Backend manzili va xarita kalitlari to'g'ridan-to'g'ri shu yerda turadi (loyiha ikki xil
// kompyuterda gitdan olinib ishlatiladi, .env gitga kirmaydi). .env dagi EXPO_PUBLIC_* qiymatlari
// berilsa, ular shu qiymatlardan ustun turadi. Backend tayyor bo'lgach geocoder serverga o'tadi.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dev-back.afish.uz'
).replace(/\/+$/, '');

export const YANDEX_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY || 'e9e77baf-a133-46b1-9f59-055744b55c57';
export const YANDEX_GEOCODER_API_KEY =
  process.env.EXPO_PUBLIC_YANDEX_GEOCODER_API_KEY || 'ca902206-f8b0-42a0-8ba2-9ae813f026d8';

// Imkoniyat bayroqlari. Onlayn to'lov (ikkinchi versiya) qo'shilguncha hamyon balansi yashirin.
export const FEATURES = {
  walletBalance: false,
  // "Barcha xizmatlar" tepasidagi umumiy statistika: ma'lumotlar yetarli bo'lgach yoqiladi.
  overallStats: false,
  // Profildagi "Manzillarim" (saqlangan manzillar ro'yxati): hozircha yashirin, ekran saqlab qo'yilgan.
  savedAddresses: false,
};

// Qo'llab-quvvatlash aloqa ma'lumotlari — saytdagi (dev.afish.uz/config.json) bilan bir xil.
// Telegram/Instagram saytda hozircha bo'sh: bo'sh qiymat ilovada ham ko'rsatilmaydi.
export const SUPPORT_CONTACT = {
  phone: '+998942599590',
  email: 'support@afish.uz',
  telegram: '',
};

export const ENDPOINTS = {
  AUTH_GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google/login`,
  CUSTOMER_LOGIN: `${API_BASE_URL}/api/v1/auth/customer/login`,
  AUTH_CUSTOMER_START: `${API_BASE_URL}/api/v1/auth/customer/start`,
  AUTH_CUSTOMER_VERIFY: `${API_BASE_URL}/api/v1/auth/customer/verify`,
  AUTH_CUSTOMER_COMPLETE: `${API_BASE_URL}/api/v1/auth/customer/complete`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  AUTH_REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  AUTH_SET_PASSWORD: `${API_BASE_URL}/api/v1/auth/set-password`,
  NOTIFICATIONS: (page = 1, size = 15) =>
    `${API_BASE_URL}/api/v1/notifications?page=${page}&size=${size}`,
  NOTIFICATIONS_UNREAD: `${API_BASE_URL}/api/v1/notifications/unread-count`,
  NOTIFICATIONS_READ_ALL: `${API_BASE_URL}/api/v1/notifications/read-all`,
  NOTIFICATION_READ: (id) => `${API_BASE_URL}/api/v1/notifications/${id}/read`,
  FAQ: `${API_BASE_URL}/api/v1/faq`,
  SUPPORT_MESSAGES: `${API_BASE_URL}/api/v1/support/messages`,
  SUPPORT_CONVERSATION: `${API_BASE_URL}/api/v1/support/conversation`,
  SUPPORT_CONVERSATION_READ: `${API_BASE_URL}/api/v1/support/conversation/read`,
  SUPPORT_ITEMS: (kind) => `${API_BASE_URL}/api/v1/support/items?kind=${kind}`,
  BADGE_LEVELS: `${API_BASE_URL}/api/v1/badges/levels`,
  CUSTOMER_REVIEWS: (customerId, limit = 20) =>
    `${API_BASE_URL}/api/v1/reviews/customers/${customerId}?limit=${limit}`,
  VERIFY_EMAIL_REQUEST_OTP: `${API_BASE_URL}/api/v1/auth/verify-email/request-otp`,
  VERIFY_EMAIL_VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/verify-email/verify-otp`,
  VERIFY_STATUS: `${API_BASE_URL}/api/v1/auth/verify/status`,
  VERIFY_UPLOAD_URL: `${API_BASE_URL}/api/v1/auth/verify/manual/upload-url`,
  VERIFY_SUBMIT: `${API_BASE_URL}/api/v1/auth/verify/manual/submit`,
  VERIFY_START: `${API_BASE_URL}/api/v1/auth/verify/start`,
  TELEGRAM_LINK_STATUS: `${API_BASE_URL}/api/v1/auth/telegram/status`,
  TELEGRAM_LINK: `${API_BASE_URL}/api/v1/auth/telegram/link`,
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
  ORDER_DECLINE: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/decline`,
  ORDER_SEND_TO: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/send-to`,
  ORDER_PUBLISH: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/publish`,
  ORDER_CANCEL: (orderId) => `${API_BASE_URL}/api/v1/orders/${orderId}/cancel-by-customer`,

  // Usta xizmat e'lonlari. `browse` sahifalangan ({ items, pagination }) va barcha filtrlarni biladi.
  LISTINGS_BROWSE: `${API_BASE_URL}/api/v1/listings/browse`,
  LISTING_DETAIL: (listingId) => `${API_BASE_URL}/api/v1/listings/${listingId}`,
  LISTING_COMMENTS: (listingId) => `${API_BASE_URL}/api/v1/listings/${listingId}/comments`,
  LISTING_COMMENT: (listingId, commentId) =>
    `${API_BASE_URL}/api/v1/listings/${listingId}/comments/${commentId}`,
  LISTING_FAVORITES: (page = 1, size = 12) =>
    `${API_BASE_URL}/api/v1/customers/me/listing-favorites?page=${page}&size=${size}`,
  LISTING_FAVORITE: (listingId) =>
    `${API_BASE_URL}/api/v1/customers/me/listing-favorites/${listingId}`,
  LISTING_LIKE: (listingId) => `${API_BASE_URL}/api/v1/listings/${listingId}/like`,
};
// https://engraver-garnet-scalded.ngrok-free.dev
// http://10.240.8.109:9494
