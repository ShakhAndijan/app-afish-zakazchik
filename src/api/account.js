import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';
import { uploadImageToPresignedUrl } from './auth';

// ─── Mijoz statusi (Bronza / Kumush / Oltin) ─────────────────────

/**
 * Status darajalari qoidalari (ochiq endpoint):
 * `{ customer: { bronze: { min_orders, max_cancel_pct, min_rating }, silver, gold }, worker }`.
 */
export const getBadgeLevels = () =>
  request(ENDPOINTS.BADGE_LEVELS, { fallbackMessage: 'Status qoidalari yuklanmadi' });

// ─── Ustalar mijozga bergan baholar ──────────────────────────────

/** Mijoz haqida ustalar qoldirgan baholar: `[{ id, rating, comment, created_at }]`. */
export async function getCustomerReviews(customerId, limit = 20) {
  const data = await request(ENDPOINTS.CUSTOMER_REVIEWS(customerId, limit), {
    fallbackMessage: 'Baholar yuklanmadi',
  });
  const list = Array.isArray(data) ? data : (data?.items ?? []);
  return list.map((r) => ({
    id: r.id,
    rating: Number(r.rating) || 0,
    comment: (r.comment ?? '').trim(),
    createdAt: r.created_at ?? null,
  }));
}

// ─── Shaxsni tasdiqlash ──────────────────────────────────────────

/**
 * @returns {Promise<{ submission_status: 'not_submitted'|'pending'|'approved'|'rejected',
 *   rejected_reason?: string|null, available_providers?: string[] }>}
 */
export const getIdentityStatus = () =>
  request(ENDPOINTS.VERIFY_STATUS, { fallbackMessage: 'Tasdiqlash holati yuklanmadi' });

/**
 * Hujjat va selfie rasmlarini presigned URL orqali yuklab, administratorga tekshiruvga yuboradi.
 * @param {{ uri: string, mimeType?: string }[]} files kamida 2 ta (hujjat, selfie), ko'pi bilan 5 ta
 */
export async function submitIdentityDocuments(files) {
  const tempKeys = [];
  for (const file of files) {
    const contentType = file.mimeType || 'image/jpeg';
    const { upload_url, temp_key } = await request(ENDPOINTS.VERIFY_UPLOAD_URL, {
      method: 'POST',
      body: { content_type: contentType },
      fallbackMessage: 'Rasm yuklash manzili olinmadi',
    });
    await uploadImageToPresignedUrl(upload_url, file.uri, contentType);
    tempKeys.push(temp_key);
  }
  return request(ENDPOINTS.VERIFY_SUBMIT, {
    method: 'POST',
    body: { temp_keys: tempKeys },
    fallbackMessage: 'Hujjat yuborilmadi',
  });
}

/** MyID orqali tezkor tasdiqlashni boshlaydi; `redirect_url` ni brauzerda ochish kerak. */
export const startIdentityProvider = (provider = 'myid') =>
  request(ENDPOINTS.VERIFY_START, {
    method: 'POST',
    body: { provider },
    fallbackMessage: 'Tasdiqlashni boshlab bo‘lmadi',
  });

// ─── Email tasdiqlash ────────────────────────────────────────────

/** Email manziliga tasdiqlash kodi yuboradi (boshqa manzil kiritilsa, tasdiqlangach hisobdagi email almashadi). */
export const requestEmailOtp = (email) =>
  request(ENDPOINTS.VERIFY_EMAIL_REQUEST_OTP, {
    method: 'POST',
    body: { email },
    fallbackMessage: 'Kod yuborib bo‘lmadi',
  });

export const verifyEmailOtp = (email, code) =>
  request(ENDPOINTS.VERIFY_EMAIL_VERIFY_OTP, {
    method: 'POST',
    body: { email, code },
    fallbackMessage: 'Kodni tasdiqlab bo‘lmadi',
  });

// ─── Telegram ulash ──────────────────────────────────────────────

/** `{ enabled: boolean, linked: boolean }` — `enabled` false bo'lsa Telegram bu muhitda o'chiq. */
export const getTelegramStatus = () =>
  request(ENDPOINTS.TELEGRAM_LINK_STATUS, { fallbackMessage: 'Telegram holati yuklanmadi' });

/** Botga o'tish havolasi (bir martalik, bir necha daqiqada eskiradi): `{ url }`. */
export const createTelegramLink = () =>
  request(ENDPOINTS.TELEGRAM_LINK, {
    method: 'POST',
    body: {},
    fallbackMessage: 'Telegram havolasi olinmadi',
  });

export async function unlinkTelegram() {
  await request(ENDPOINTS.TELEGRAM_LINK, {
    method: 'DELETE',
    fallbackMessage: 'Telegramni uzib bo‘lmadi',
  });
}
