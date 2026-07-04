import { ENDPOINTS } from '../constants/config';

export async function getCategories() {
  console.log('[categories] so\'rov yuborilmoqda:', ENDPOINTS.CATEGORIES);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(ENDPOINTS.CATEGORIES, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: controller.signal,
    });
  } catch (err) {
    console.log('[categories] fetch bajarilmadi:', err.name, err.message);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  console.log('[categories] javob keldi, status:', res.status);

  if (!res.ok) {
    throw new Error(`Categories fetch failed: ${res.status}`);
  }

  const json = await res.json();
  console.log('[categories] response_data uzunligi:', json.response_data?.length);
  return json.response_data ?? [];
}
