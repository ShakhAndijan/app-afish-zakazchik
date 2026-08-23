import { ENDPOINTS } from '../constants/config';

export async function getSystemStats() {
  const res = await fetch(ENDPOINTS.SYSTEM_STATS);
  if (!res.ok) {
    throw new Error(`System stats fetch failed: ${res.status}`);
  }
  const json = await res.json();
  return json.response_data ?? null;
}
