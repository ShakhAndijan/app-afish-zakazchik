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
