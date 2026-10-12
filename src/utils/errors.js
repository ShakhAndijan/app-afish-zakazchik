import { ApiError } from './request';

/**
 * Xatoni foydalanuvchi tilidagi matnga aylantiradi.
 *  - tarmoq / timeout / 5xx: har doim tarjima qilingan umumiy matn
 *  - backend xabar bergan xato: o'sha xabar
 *  - qolgan holat: ekranning o'z tarjima qilingan matni (fallbackKey)
 * ApiError bo'lmagan xatolarda (masalan Google kirish) `e.message` ishlatiladi.
 */
export function getErrorMessage(e, t, fallbackKey = 'common.error') {
  if (e instanceof ApiError) {
    if (e.isNetwork) return t('errors.network');
    if (e.isTimeout) return t('errors.timeout');
    if (e.status >= 500) return t('errors.server');
    if (e.serverMessage) return e.message;
    return t(fallbackKey);
  }
  return e?.message || t(fallbackKey);
}
