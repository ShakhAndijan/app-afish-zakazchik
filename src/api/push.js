import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Mobil push (FCM): qurilma tokenini backendga bog'lash. Backend tokenni foydalanuvchiga biriktiradi
// va hodisa bo'lganda FCM orqali yuboradi, shuning uchun ilova yopiq bo'lsa ham xabar keladi.

/**
 * Tokenni saqlaydi (token bo'yicha upsert); javob `{ devices }` — foydalanuvchining qurilmalari soni.
 * `format: 'notification'` — FCM'ning tayyor title/body xabari: ilova yopiq bo'lsa ham tizim o'zi ko'rsatadi.
 * `locale` — xabar matni tili.
 */
export function registerPushDevice({ token, platform, locale, appVersion }) {
  return request(ENDPOINTS.PUSH_DEVICES, {
    method: 'POST',
    body: { token, platform, format: 'notification', locale, app_version: appVersion },
    timeout: 10000,
    fallbackMessage: 'Push qurilmasi saqlanmadi',
  });
}

/** Chiqishda tokenni o'chiradi: boshqa foydalanuvchi shu qurilmada xabar olmasligi uchun. */
export function unregisterPushDevice(token) {
  return request(ENDPOINTS.PUSH_DEVICES_REMOVE, {
    method: 'POST',
    body: { token },
    timeout: 5000,
    fallbackMessage: "Push qurilmasi o'chirilmadi",
  });
}
