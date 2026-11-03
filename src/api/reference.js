import { ENDPOINTS } from '../constants/config';
import { request, ApiError } from '../utils/request';

const getList = async (url) => (await request(url)) ?? [];

export const getGenders = () => getList(ENDPOINTS.GENDERS);
export const getRegions = () => getList(ENDPOINTS.REGIONS);
export const getDistricts = (regionId) => getList(ENDPOINTS.DISTRICTS(regionId));

// Koordinataga eng yaqin viloyat/tuman. Topilmasa (404 region_not_found) — null.
export async function getNearestRegion(lat, lon) {
  try {
    const data = await request(ENDPOINTS.REGION_NEAREST(lat, lon), { auth: false });
    if (!data?.region) return null;
    return {
      region: data.region,
      district: data.district ?? null,
      accuracy: data.accuracy ?? null,
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
