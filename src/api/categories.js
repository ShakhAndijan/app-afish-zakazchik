import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

export async function getCategories() {
  return (await request(ENDPOINTS.CATEGORIES)) ?? [];
}
