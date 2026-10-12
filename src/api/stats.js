import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Ochiq endpoint: token yuborilmaydi.
export async function getSystemStats() {
  return (await request(ENDPOINTS.SYSTEM_STATS, { auth: false })) ?? null;
}
