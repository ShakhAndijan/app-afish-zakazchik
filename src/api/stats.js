import { ENDPOINTS } from '../constants/config';

export async function getSystemStats() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(ENDPOINTS.SYSTEM_STATS, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`System stats fetch failed: ${res.status}`);
  }
  const json = await res.json();
  return json.response_data ?? null;
}
