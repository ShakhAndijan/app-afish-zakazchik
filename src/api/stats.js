import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Ochiq endpoint: token yuborilmaydi.
export async function getSystemStats() {
  return (await request(ENDPOINTS.SYSTEM_STATS, { auth: false })) ?? null;
}

// Server sozlamalari: qaysi kod kanallari (sms/telegram) va Google orqali kirish yoqilgani.
export async function getSystemInfo() {
  const info = await request(ENDPOINTS.SYSTEM_INFO, { auth: false });
  if (!info) return null;
  return {
    otpChannels: Array.isArray(info.otp_channels) ? info.otp_channels : null,
    googleLogin: info.google_login !== false,
  };
}
