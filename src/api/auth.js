import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import { ENDPOINTS } from '../constants/config';

export async function uploadImageToPresignedUrl(
  uploadUrl,
  imageUri,
  contentType
) {
  const ct = contentType || 'image/jpeg';

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // base64 → binary bytes (React Native da data: URI yo'q, XHR kerak)
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', ct);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Rasmni yuklashda xatolik: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Rasmni yuklashda tarmoq xatosi'));
    xhr.send(bytes.buffer);
  });
}

export async function loginCustomer(phone, password) {
  const res = await fetch(ENDPOINTS.CUSTOMER_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kirishda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data;
}

export async function requestLoginOtp(phone) {
  const res = await fetch(ENDPOINTS.LOGIN_REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kod yuborishda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data; // { sent, dev_code }
}

/**
 * Login va ro'yxatdan o'tish uchun birlashgan OTP tasdiqlash.
 * Faqat phone+code yuborilsa: mavjud mijoz uchun tokenlarni qaytaradi.
 * Mijoz hali ro'yxatdan o'tmagan bo'lsa, `extra`ga first_name/last_name/email/password
 * qo'shib qayta chaqiriladi va yangi hisob shu yerda yaratiladi.
 * @returns {Promise<{ is_registered: boolean, access_token?: string, refresh_token?: string }>}
 */
export async function verifyLoginOtp(phone, code, extra = {}) {
  const res = await fetch(ENDPOINTS.LOGIN_VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kodni tasdiqlashda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data;
}

export async function requestResetPasswordOtp(phone) {
  const res = await fetch(ENDPOINTS.RESET_PASSWORD_REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, actor_type: 'customer' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kod yuborishda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data; // { sent, dev_code }
}

export async function verifyResetPasswordOtp(phone, code, newPassword) {
  const res = await fetch(ENDPOINTS.RESET_PASSWORD_VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      actor_type: 'customer',
      code,
      new_password: newPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Parolni saqlashda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data;
}

export async function requestEmailLoginOtp(email) {
  const res = await fetch(ENDPOINTS.EMAIL_LOGIN_REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kod yuborishda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data; // { sent, dev_code }
}

export async function verifyEmailLoginOtp(email, code) {
  const res = await fetch(ENDPOINTS.EMAIL_LOGIN_VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kodni tasdiqlashda xatolik yuz berdi');
  }
  const data = await res.json();
  return data.response_data; // { access_token, refresh_token }
}

export async function googleLogin(actorType = 'customer') {
  const redirectUri = Linking.createURL('auth/callback');
  const loginUrl =
    `${ENDPOINTS.AUTH_GOOGLE_LOGIN}?actor_type=${actorType}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUri);

  if (result.type !== 'success') {
    throw new Error('cancelled');
  }

  const parsed = Linking.parse(result.url);
  const params = parsed.queryParams ?? {};
  const token = params.token || params.access_token;

  if (!token) {
    throw new Error('Tokenni olishda xatolik');
  }

  return { token, refreshToken: params.refresh_token };
}
