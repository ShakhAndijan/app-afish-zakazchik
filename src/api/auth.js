import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import { ENDPOINTS } from '../constants/config';

const logReq = (name, payload) => console.log(`[auth] → ${name}`, payload);
const logOk = (name, data) => console.log(`[auth] ✓ ${name}`, data);
const logErr = (name, err) => console.log(`[auth] ✗ ${name}`, err?.message || err);

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
  logReq('loginCustomer', { phone });
  const res = await fetch(ENDPOINTS.CUSTOMER_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    logErr('loginCustomer', err);
    throw new Error(err.message || 'Kirishda xatolik yuz berdi');
  }
  const data = await res.json();
  logOk('loginCustomer', data.response_data);
  return data.response_data;
}

/**
 * Telefon/emailga tasdiqlash kodini yuboradi. Hisob mavjudligidan qat'i nazar
 * javob har doim bir xil (200) — bu raqamni "bazada bormi yo'qmi" deb sinab
 * ko'rishning oldini oladi.
 * @returns {Promise<{ sent: boolean, dev_code?: string }>}
 */
export async function startCustomerAuth(identifier, channel = 'sms') {
  logReq('startCustomerAuth', { identifier, channel });
  const res = await fetch(ENDPOINTS.AUTH_CUSTOMER_START, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, channel }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    logErr('startCustomerAuth', err);
    throw new Error(err.message || 'Kod yuborishda xatolik yuz berdi');
  }
  const data = await res.json();
  logOk('startCustomerAuth', data.response_data);
  return data.response_data;
}

/**
 * Kodni tasdiqlaydi. Ikki xil natija bo'lishi mumkin (AuthVerifyOut):
 * - hisob mavjud: access_token/refresh_token qaytadi, shu bilan kirish tugaydi;
 * - hisob topilmadi (`status: 'needs_name'`), `ticket` qaytadi (tasdiqlangan
 *   kodning isboti). Agar shu bilan birga `suggested_first_name`/
 *   `suggested_last_name` ham qaytgan bo'lsa (masalan avval usta sifatida
 *   ro'yxatdan o'tgan bo'lsa, ismi ma'lum), foydalanuvchidan qayta
 *   so'ramasdan shu qiymatlar bilan completeCustomerAuth avtomatik
 *   chaqiriladi; aks holda ism-familiya so'raladi va shu bilan
 *   completeCustomerAuth chaqiriladi.
 * @returns {Promise<{ access_token: string|null, refresh_token: string|null, status?: string, ticket?: string, suggested_first_name?: string, suggested_last_name?: string }>}
 */
export async function verifyCustomerAuth(identifier, code) {
  logReq('verifyCustomerAuth', { identifier, code });
  const res = await fetch(ENDPOINTS.AUTH_CUSTOMER_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    logErr('verifyCustomerAuth', err);
    throw new Error(err.message || 'Kodni tasdiqlashda xatolik yuz berdi');
  }
  const data = await res.json();
  logOk('verifyCustomerAuth', data.response_data);
  return data.response_data;
}

/**
 * Yangi mijoz hisobini yaratadi va kirishni yakunlaydi. Faqat verify hisobni
 * topa olmagan holatda chaqiriladi — `ticket` allaqachon tasdiqlangan kodning
 * isboti bo'lgani uchun kod qayta so'ralmaydi, faqat ism-familiya kerak.
 * @returns {Promise<{ access_token: string, refresh_token: string }>}
 */
export async function completeCustomerAuth(ticket, firstName, lastName) {
  logReq('completeCustomerAuth', { ticket, first_name: firstName, last_name: lastName });
  const res = await fetch(ENDPOINTS.AUTH_CUSTOMER_COMPLETE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticket,
      first_name: firstName,
      last_name: lastName,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    logErr('completeCustomerAuth', err);
    throw new Error(err.message || "Hisob yaratishda xatolik yuz berdi");
  }
  const data = await res.json();
  logOk('completeCustomerAuth', data.response_data);
  return data.response_data;
}

export async function requestResetPasswordOtp(phone) {
  logReq('requestResetPasswordOtp', { phone });
  const res = await fetch(ENDPOINTS.RESET_PASSWORD_REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, actor_type: 'customer' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    logErr('requestResetPasswordOtp', err);
    throw new Error(err.message || 'Kod yuborishda xatolik yuz berdi');
  }
  const data = await res.json();
  logOk('requestResetPasswordOtp', data.response_data);
  return data.response_data; // { sent, dev_code }
}

export async function verifyResetPasswordOtp(phone, code, newPassword) {
  logReq('verifyResetPasswordOtp', { phone, code });
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
    logErr('verifyResetPasswordOtp', err);
    throw new Error(err.message || 'Parolni saqlashda xatolik yuz berdi');
  }
  const data = await res.json();
  logOk('verifyResetPasswordOtp', data.response_data);
  return data.response_data;
}

export async function googleLogin(actorType = 'customer') {
  const redirectUri = Linking.createURL('auth/callback');
  const loginUrl =
    `${ENDPOINTS.AUTH_GOOGLE_LOGIN}?actor_type=${actorType}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  logReq('googleLogin', { actorType, loginUrl });
  const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUri);

  if (result.type !== 'success') {
    logErr('googleLogin', 'cancelled');
    throw new Error('cancelled');
  }

  const parsed = Linking.parse(result.url);
  const params = parsed.queryParams ?? {};
  const token = params.token || params.access_token;

  if (!token) {
    logErr('googleLogin', 'token topilmadi');
    throw new Error('Tokenni olishda xatolik');
  }

  logOk('googleLogin', { hasToken: !!token, hasRefreshToken: !!params.refresh_token });
  return { token, refreshToken: params.refresh_token };
}
