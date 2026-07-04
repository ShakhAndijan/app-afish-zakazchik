import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import { ENDPOINTS } from '../constants/config';

export async function requestRegisterOtp(phone) {
  const res = await fetch(ENDPOINTS.REGISTER_REQUEST_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log('[requestRegisterOtp] ERROR:', err);
    throw new Error(err.message || 'OTP yuborishda xatolik yuz berdi');
  }
  const data = await res.json();
  console.log('[requestRegisterOtp]', data);
  return data.response_data;
}

export async function getRegisterUploadUrl(phone, code, contentType) {
  const res = await fetch(ENDPOINTS.REGISTER_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, content_type: contentType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log('[getRegisterUploadUrl] ERROR:', err);
    throw new Error(err.message || 'Yuklash URL olishda xatolik');
  }
  const data = await res.json();
  console.log('[getRegisterUploadUrl]', data);
  return data.response_data; // { upload_url, temp_key, expires_in }
}

export async function verifyRegisterOtp(payload) {
  console.log('[verifyRegisterOtp] so\'rov:', payload);
  const res = await fetch(ENDPOINTS.REGISTER_VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log('[verifyRegisterOtp] ERROR:', err);
    throw new Error(err.message || "Ro'yxatdan o'tishni yakunlashda xatolik");
  }
  const data = await res.json();
  console.log('[verifyRegisterOtp]', data);
  return data.response_data;
}

export async function uploadImageToPresignedUrl(uploadUrl, imageUri, contentType) {
  const ct = contentType || 'image/jpeg';

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  console.log('[upload] base64 length:', base64.length, 'contentType:', ct);

  // base64 → binary bytes (React Native da data: URI yo'q, XHR kerak)
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  console.log('[upload] bytes size:', bytes.length);

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', ct);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      console.log('[upload] XHR status:', xhr.status, xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Rasmni yuklashda xatolik: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Rasmni yuklashda tarmoq xatosi'));
    xhr.send(bytes.buffer);
  });
  console.log('[upload] OK');
}

export async function googleLogin(actorType = 'customer') {
  const redirectUri = Linking.createURL('auth/callback');
  const loginUrl =
    `${ENDPOINTS.AUTH_GOOGLE_LOGIN}?actor_type=${actorType}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUri);
  console.log('[googleLogin]', result);

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
