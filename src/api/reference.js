import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

const getList = async (url) => (await request(url)) ?? [];

export const getGenders = () => getList(ENDPOINTS.GENDERS);
export const getRegions = () => getList(ENDPOINTS.REGIONS);
export const getDistricts = (regionId) => getList(ENDPOINTS.DISTRICTS(regionId));
