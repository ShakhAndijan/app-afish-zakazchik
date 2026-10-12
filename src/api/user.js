import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';
import { devLog } from '../utils/log';

export async function getMe() {
  const data = await request(ENDPOINTS.AUTH_ME, { timeout: 10000 });
  devLog('[getMe] /auth/me response:', data);
  return data;
}

/**
 * Profilni tahrirlash formasi uchun joriy mijoz ma'lumotlarini oladi.
 */
export async function getCustomerMe() {
  const data = await request(ENDPOINTS.CUSTOMER_ME, { timeout: 10000 });
  devLog('[getCustomerMe] /customers/me response:', data);
  return data;
}

/**
 * Profilni tahrirlash formasidagi o'zgarishlarni backendga saqlaydi.
 */
export const updateCustomerMe = (payload) =>
  request(ENDPOINTS.CUSTOMER_ME, {
    method: 'PATCH',
    body: payload,
    fallbackMessage: 'Profilni saqlashda xatolik yuz berdi',
  });

/**
 * Tizimga kirgan foydalanuvchi joriy parolini bilib turib yangisiga almashtiradi.
 */
export const setPassword = (currentPassword, newPassword) =>
  request(ENDPOINTS.AUTH_SET_PASSWORD, {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
    fallbackMessage: 'Parolni yangilashda xatolik yuz berdi',
  });

/**
 * Yangi telefon raqamiga tasdiqlash kodi yuborishni so'raydi.
 * @returns {Promise<{ sent: boolean, dev_code: string }>}
 */
export const requestChangePhoneOtp = (newPhone) =>
  request(ENDPOINTS.AUTH_CHANGE_PHONE_REQUEST_OTP, {
    method: 'POST',
    body: { new_phone: newPhone },
    fallbackMessage: 'Kod yuborishda xatolik yuz berdi',
  });

/**
 * Yangi telefon raqamini SMS orqali kelgan kod bilan tasdiqlaydi.
 * Muvaffaqiyatli bo'lsa backend `/auth/me`dagi phone'ni yangilaydi.
 */
export const verifyChangePhoneOtp = (newPhone, code) =>
  request(ENDPOINTS.AUTH_CHANGE_PHONE_VERIFY_OTP, {
    method: 'POST',
    body: { new_phone: newPhone, code },
    fallbackMessage: 'Kodni tasdiqlashda xatolik yuz berdi',
  });

/**
 * Avatar rasmini yuklash uchun presigned URL so'raydi.
 * @returns {Promise<{ upload_url: string, temp_key: string, expires_in: number }>}
 */
export const getAvatarUploadUrl = (contentType) =>
  request(ENDPOINTS.CUSTOMER_AVATAR_UPLOAD_URL, {
    method: 'POST',
    body: { content_type: contentType },
    fallbackMessage: 'Avatar yuklash uchun manzil olinmadi',
  });

/**
 * Joriy avatar rasmini backenddan o'chiradi.
 * Muvaffaqiyatli bo'lsa backend `/auth/me`dagi profile_photo'ni ham tozalaydi.
 */
export async function deleteAvatar() {
  await request(ENDPOINTS.CUSTOMER_AVATAR, {
    method: 'DELETE',
    fallbackMessage: "Avatarni o'chirib bo'lmadi",
  });
}

/**
 * Presigned URL'ga yuklangan rasmni doimiy avatar sifatida tasdiqlaydi.
 * Muvaffaqiyatli bo'lsa backend `/auth/me`dagi profile_photo'ni yangilaydi.
 */
export const confirmAvatar = (tempKey) =>
  request(ENDPOINTS.CUSTOMER_AVATAR_CONFIRM, {
    method: 'POST',
    body: { temp_key: tempKey },
    fallbackMessage: "Avatarni tasdiqlab bo'lmadi",
  });
