import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Hisobga saqlangan til va mavzu (GET/PATCH /auth/preferences). Maydon yo'q — tegilmaydi, `null` — tozalanadi.

/** `{ language, theme }`; tanlanmagan bo'lsa qiymat `null`. */
export async function getPreferences() {
  const data = await request(ENDPOINTS.AUTH_PREFERENCES, {
    fallbackMessage: 'Sozlamalar yuklanmadi',
  });
  return { language: data?.language ?? null, theme: data?.theme ?? null };
}

/** Faqat berilgan maydonlar yangilanadi: `updatePreferences({ language: 'cr' })`. */
export function updatePreferences(patch) {
  return request(ENDPOINTS.AUTH_PREFERENCES, {
    method: 'PATCH',
    body: patch,
    fallbackMessage: 'Sozlamalar saqlanmadi',
  });
}
