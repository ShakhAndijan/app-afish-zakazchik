import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

export async function getMe() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await apiFetch(ENDPOINTS.AUTH_ME, {
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = new Error(`Me fetch failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  console.log('[getMe] /auth/me response:', json.response_data);
  return json.response_data;
}

/**
 * Profilni tahrirlash formasi uchun joriy mijoz ma'lumotlarini oladi.
 */
export async function getCustomerMe() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await apiFetch(ENDPOINTS.CUSTOMER_ME, {
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = new Error(`Customer me fetch failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  console.log('[getCustomerMe] /customers/me response:', json.response_data);
  return json.response_data;
}

/**
 * Profilni tahrirlash formasidagi o'zgarishlarni backendga saqlaydi.
 */
export async function updateCustomerMe(payload) {
  const res = await apiFetch(ENDPOINTS.CUSTOMER_ME, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || 'Profilni saqlashda xatolik yuz berdi');
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}

/**
 * Tizimga kirgan foydalanuvchi joriy parolini bilib turib yangisiga almashtiradi.
 */
export async function setPassword(currentPassword, newPassword) {
  const res = await apiFetch(ENDPOINTS.AUTH_SET_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || 'Parolni yangilashda xatolik yuz berdi');
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}

/**
 * Yangi telefon raqamiga tasdiqlash kodi yuborishni so'raydi.
 * @returns {Promise<{ sent: boolean, dev_code: string }>}
 */
export async function requestChangePhoneOtp(newPhone) {
  const res = await apiFetch(ENDPOINTS.AUTH_CHANGE_PHONE_REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_phone: newPhone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || 'Kod yuborishda xatolik yuz berdi');
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}

/**
 * Yangi telefon raqamini SMS orqali kelgan kod bilan tasdiqlaydi.
 * Muvaffaqiyatli bo'lsa backend `/auth/me`dagi phone'ni yangilaydi.
 */
export async function verifyChangePhoneOtp(newPhone, code) {
  const res = await apiFetch(ENDPOINTS.AUTH_CHANGE_PHONE_VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_phone: newPhone, code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || 'Kodni tasdiqlashda xatolik yuz berdi');
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}

/**
 * Avatar rasmini yuklash uchun presigned URL so'raydi.
 * @returns {Promise<{ upload_url: string, temp_key: string, expires_in: number }>}
 */
export async function getAvatarUploadUrl(contentType) {
  const res = await apiFetch(ENDPOINTS.CUSTOMER_AVATAR_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: contentType }),
  });

  if (!res.ok) {
    const err = new Error(`Avatar upload-url so'rovi muvaffaqiyatsiz: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  return json.response_data;
}

/**
 * Joriy avatar rasmini backenddan o'chiradi.
 * Muvaffaqiyatli bo'lsa backend `/auth/me`dagi profile_photo'ni ham tozalaydi.
 */
export async function deleteAvatar() {
  const res = await apiFetch(ENDPOINTS.CUSTOMER_AVATAR, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = new Error(`Avatar o'chirish muvaffaqiyatsiz: ${res.status}`);
    err.status = res.status;
    throw err;
  }
}

/**
 * Presigned URL'ga yuklangan rasmni doimiy avatar sifatida tasdiqlaydi.
 * Muvaffaqiyatli bo'lsa backend `/auth/me`dagi profile_photo'ni yangilaydi.
 */
export async function confirmAvatar(tempKey) {
  const res = await apiFetch(ENDPOINTS.CUSTOMER_AVATAR_CONFIRM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ temp_key: tempKey }),
  });

  if (!res.ok) {
    const err = new Error(`Avatar confirm muvaffaqiyatsiz: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  return json.response_data;
}
