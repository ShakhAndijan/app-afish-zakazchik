import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

async function getList(url, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await apiFetch(url, {
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`${label} fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return json.response_data ?? [];
}

export const getGenders = () => getList(ENDPOINTS.GENDERS, 'genders');
export const getRegions = () => getList(ENDPOINTS.REGIONS, 'regions');
export const getDistricts = (regionId) =>
  getList(ENDPOINTS.DISTRICTS(regionId), 'districts');
