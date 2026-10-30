import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Backenddagi hujjat kalitlari (GET /legal/{key}). "Biz haqimizda" backendda yo'q, u ilovada statik.
export const LEGAL_KEYS = ['privacy', 'terms', 'consent', 'delete-account'];

// Backendga yetib bo'lmasa ishlatiladigan rozilik matni versiyasi (hozirgi amaldagisi).
export const FALLBACK_CONSENT_VERSION = 'consent-v1';

/** `{ consentVersion, documents: [{ key, revision, publishedAt }] }` — ochiq endpoint. */
export async function getLegalIndex() {
  const data = await request(ENDPOINTS.LEGAL, {
    auth: false,
    fallbackMessage: 'Hujjatlar ro‘yxati yuklanmadi',
  });
  return {
    consentVersion: data?.consent_version || FALLBACK_CONSENT_VERSION,
    documents: (data?.documents ?? []).map((d) => ({
      key: d.key,
      revision: d.revision,
      publishedAt: d.published_at ?? null,
    })),
  };
}

/**
 * Bitta hujjat, so'rov tilida (Accept-Language). Tarjimasi bo'lmagan tilda boshqa til qaytishi mumkin
 * (`lang` shuni aytadi). `sections[].p` ichida qator uzilishlari bor, "• " bilan boshlangan qator — ro'yxat bandi.
 */
export async function getLegalDocument(key) {
  const data = await request(ENDPOINTS.LEGAL_DOC(key), {
    auth: false,
    fallbackMessage: 'Hujjat yuklanmadi',
  });
  return {
    key: data.key,
    revision: data.revision,
    publishedAt: data.published_at ?? null,
    lang: data.lang,
    title: data.title ?? '',
    sections: (data.sections ?? []).map((s) => ({ h: s.h ?? '', p: s.p ?? '' })),
  };
}

// ─── Shaxsiy ma'lumotlarga rozilik ───────────────────────────────

/** Kirgan foydalanuvchining roziligi: `{ version, acceptedAt, required }`; `required` — qayta rozilik kerak. */
export async function getConsentStatus() {
  const data = await request(ENDPOINTS.AUTH_CONSENT, {
    fallbackMessage: 'Rozilik holati yuklanmadi',
  });
  return {
    version: data?.version ?? null,
    acceptedAt: data?.accepted_at ?? null,
    required: !!data?.required,
  };
}

/** Roziligini qayd etadi (takror yuborish hech narsani o'zgartirmaydi; eski versiya — 400 `consent_outdated`). */
export const acceptConsent = (version) =>
  request(ENDPOINTS.AUTH_CONSENT, {
    method: 'POST',
    body: { version },
    fallbackMessage: 'Rozilikni saqlab bo‘lmadi',
  });

// ─── Hisobni o'chirish ───────────────────────────────────────────

/**
 * Hisobni o'chirsa nima bo'lishini aytadi (hech narsa o'zgarmaydi).
 * `blockers[].kind`: active_order | wallet_balance | held_money | pending_withdrawal | blocked.
 */
export async function getAccountDeletion() {
  const data = await request(ENDPOINTS.ACCOUNT_DELETION, {
    fallbackMessage: 'Ma‘lumot yuklanmadi',
  });
  return {
    canDelete: !!data?.can_delete,
    blockers: (data?.blockers ?? []).map((b) => ({
      kind: b.kind,
      orderId: b.order_id ?? null,
      orderCode: b.order_code ?? null,
      amount: b.amount ?? null,
      until: b.until ?? null,
    })),
    cancelsOrders: Number(data?.cancels_orders) || 0,
    restoreDays: Number(data?.restore_days) || 30,
  };
}

/** Hisobni darhol yopadi; `restoreUntil` gacha orqa ofis tiklay oladi. 409 `account_deletion_blocked` — to'siq bor. */
export async function deleteAccount() {
  const data = await request(ENDPOINTS.ACCOUNT_DELETE, {
    method: 'POST',
    body: {},
    timeout: 30000,
    fallbackMessage: 'Hisobni o‘chirib bo‘lmadi',
  });
  return { deletedAt: data?.deleted_at ?? null, restoreUntil: data?.restore_until ?? null };
}
