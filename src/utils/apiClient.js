import { ENDPOINTS, CLIENT_HEADERS } from '../constants/config';
import { getToken, getRefreshToken, saveSession } from './token';
import { devLog } from './log';

const REFRESH_TIMEOUT_MS = 10000;

// Sessiya tugaganda (refresh token ham yaroqsiz) chaqiriladi; AuthContext shu yerga ulanadi.
let onSessionExpired = null;
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

/**
 * Refresh token orqali yangi juftlik oladi va saqlaydi (POST /auth/refresh).
 * Natija:
 *  - 'ok'          — yangi tokenlar saqlandi;
 *  - 'invalid'     — refresh token yaroqsiz/ishlatilgan (401, 403, 422): qayta kirish kerak;
 *  - 'unavailable' — tarmoq yoki server xatosi: sessiya saqlanadi, keyinroq qayta uriniladi.
 * Refresh token bir martalik, shuning uchun yangi juftlik qaytganda DARHOL saqlanadi.
 */
async function requestRefresh() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return 'invalid';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINTS.AUTH_REFRESH, {
      method: 'POST',
      headers: {
        ...CLIENT_HEADERS,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: controller.signal,
    });
    if (res.status === 429 || res.status >= 500) return 'unavailable';
    if (!res.ok) return 'invalid';

    const pair = (await res.json().catch(() => null))?.response_data;
    if (!pair?.access_token || !pair?.refresh_token) return 'unavailable';
    await saveSession({ accessToken: pair.access_token, refreshToken: pair.refresh_token });
    return 'ok';
  } catch (err) {
    devLog('[apiClient] refresh failed:', err?.message ?? err);
    return 'unavailable';
  } finally {
    clearTimeout(timer);
  }
}

// Bir vaqtda bir nechta so'rov 401 olsa, refresh BITTA marta yuboriladi (token bir martalik).
let refreshing = null;
function refreshSession() {
  if (!refreshing) {
    refreshing = requestRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

const send = (url, options, token) =>
  fetch(url, {
    ...options,
    headers: {
      ...CLIENT_HEADERS,
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

/**
 * fetch wrapper: saqlangan tokenni Authorization header sifatida qo'shadi.
 * Access token muddati tugab 401 kelsa, refresh token bilan tokenlar yangilanadi va so'rov
 * BIR marta qayta yuboriladi. Refresh ham yaroqsiz bo'lsa, sessiya tugatiladi (onSessionExpired).
 */
export async function apiFetch(url, options = {}) {
  const token = await getToken();
  const res = await send(url, options, token);
  // Token yuborilmagan (mehmon) yoki 401 emas — yangilash kerak emas.
  if (res.status !== 401 || !token) return res;

  // Parallel so'rov tokenni allaqachon yangilagan bo'lishi mumkin — u holda yangisi bilan qayta yuboriladi.
  let current = await getToken();
  if (current === token) {
    const outcome = await refreshSession();
    if (outcome === 'invalid') {
      onSessionExpired?.();
      return res;
    }
    if (outcome !== 'ok') return res;
    current = await getToken();
  }
  return send(url, options, current);
}
