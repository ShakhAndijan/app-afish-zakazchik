import { ENDPOINTS } from '../constants/config';

export async function getCategories() {
  const res = await fetch(ENDPOINTS.CATEGORIES, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });

  if (!res.ok) {
    throw new Error(`Categories fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return json.response_data ?? [];
}
