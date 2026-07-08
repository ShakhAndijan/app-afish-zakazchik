import { getToken } from './token';

/**
 * fetch wrapper: login/ro'yxatdan o'tishdan oldin tokensiz, login qilingandan
 * keyin esa saqlangan tokenni Authorization header sifatida avtomatik qo'shib yuboradi.
 */
export async function apiFetch(url, options = {}) {
  const token = await getToken();

  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}
