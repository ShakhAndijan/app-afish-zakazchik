import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';
import { uploadImageToPresignedUrl } from './auth';

// Backend faqat shu turlarni qabul qiladi (POST /api/v1/orders/upload-url).
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXT_TO_TYPE = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/**
 * Picker'dan kelgan mimeType yoki fayl kengaytmasidan ruxsat etilgan
 * content-type'ni aniqlaydi. Qo'llab-quvvatlanmasa (masalan HEIC) null qaytaradi.
 */
export function resolvePhotoContentType(uri, mimeType) {
  const mime = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;
  if (mime && ALLOWED_PHOTO_TYPES.includes(mime)) return mime;
  const ext = String(uri || '').split('?')[0].split('.').pop().toLowerCase();
  return EXT_TO_TYPE[ext] || null;
}

/**
 * Buyurtma rasmi uchun bitta presigned URL so'raydi (har bir rasmga alohida).
 * @returns {Promise<{ upload_url: string, temp_key: string, expires_in: number }>}
 */
export async function requestOrderPhotoUpload(contentType) {
  const res = await apiFetch(ENDPOINTS.ORDER_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: contentType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || `Rasm yuklash URL'i olinmadi: ${res.status}`);
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}

/**
 * Bitta rasmni presigned URL orqali yuklab, `photo_temp_keys`ga qo'yiladigan
 * `temp_key`ni qaytaradi.
 */
export async function uploadOrderPhoto(uri, mimeType) {
  const contentType = resolvePhotoContentType(uri, mimeType);
  if (!contentType) {
    const e = new Error('UNSUPPORTED_PHOTO_TYPE');
    e.code = 'UNSUPPORTED_PHOTO_TYPE';
    throw e;
  }
  const { upload_url, temp_key } = await requestOrderPhotoUpload(contentType);
  await uploadImageToPresignedUrl(upload_url, uri, contentType);
  return temp_key;
}

// ─── Buyurtmalar tarixi ──────────────────────────────────────────

const AVATAR_COLORS = ['#2fa37a', '#e87a45', '#3f7fd4', '#ec4899', '#8b5cf6', '#f5c451', '#06b6d4'];
const REQUEST_TIMEOUT_MS = 15000;
const PAGE_SIZE = 100; // backend maksimumi
const MAX_PAGES = 5;

// Backend holati → UI guruhi: kutilayotgan/qabul qilingan/jarayondagi buyurtmalar "active".
const STATUS_GROUP = {
  pending: 'active',
  accepted: 'active',
  active: 'active',
  completed: 'done',
  cancelled: 'cancelled',
};

const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

async function getJson(url, errorLabel) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await apiFetch(url, { signal: controller.signal });
    if (!res.ok) {
      const e = new Error(`${errorLabel}: ${res.status}`);
      e.status = res.status;
      throw e;
    }
    const json = await res.json();
    return json.response_data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Backenddagi OrderOut / OrderDetailOut obyektini UI formatiga o'giradi.
 * Ikkala shakl ham qo'llab-quvvatlanadi (ro'yxat: worker_name/task_names,
 * tafsilot: worker{}/tasks[]/category{}).
 */
export function mapOrder(o) {
  const workerName = o.worker_name ?? o.worker?.full_name ?? null;
  const workerPhoto = o.worker_photo ?? o.worker?.profile_photo ?? null;
  const workerId = o.worker_id ?? o.worker?.id ?? null;
  const taskNames = o.task_names ?? (o.tasks || []).map((t) => t.name);

  const hours = toNumber(o.estimated_hours);
  const hourlyRate = toNumber(o.hourly_rate);
  const agreed = toNumber(o.agreed_price);
  const budget = toNumber(o.budget);
  const computed = hourlyRate != null && hours != null ? hourlyRate * hours : null;

  let price = null;
  let priceKind = null;
  if (agreed != null) [price, priceKind] = [agreed, 'agreed'];
  else if (budget != null) [price, priceKind] = [budget, 'budget'];
  else if (computed != null) [price, priceKind] = [computed, 'estimate'];

  const description = (o.description || '').trim();

  return {
    id: o.id,
    rawStatus: o.status,
    status: STATUS_GROUP[o.status] || 'active',
    task: taskNames.join(', ') || description.split('\n')[0].slice(0, 80),
    categoryId: o.category_id ?? o.category?.id ?? null,
    service: o.category?.name ?? null,
    master: workerName,
    workerId,
    masterPhoto: workerPhoto,
    letter: workerName ? workerName.trim()[0].toUpperCase() : '?',
    color: AVATAR_COLORS[(workerId ?? o.id) % AVATAR_COLORS.length],
    createdAt: o.created_at,
    address: [o.region, o.district, o.mahalla, o.location_landmark].filter(Boolean).join(', '),
    estimatedHours: hours,
    hourlyRate,
    priceMode: o.price_mode ?? null,
    // Kelishuv bosqichi (ACCEPTED): kim qanday narx taklif qilgan va kelishilgan narx.
    offerPrice: toNumber(o.offer_price),
    offerBy: o.offer_by ?? null,
    agreedPrice: agreed,
    price,
    priceKind,
    paymentMethod: o.payment_method ?? null,
    paymentStatus: 'not_charged',
    beforePhotos: o.before_photos || [],
    afterPhotos: o.after_photos || [],
    cancelReason: o.cancel_reason ?? null,
  };
}

/**
 * Mijozning barcha buyurtmalari (yangisi birinchi). Backend sahifalab beradi,
 * shuning uchun to'liq ro'yxat yig'iladi (eng ko'pi bilan MAX_PAGES * PAGE_SIZE ta).
 */
export async function getMyOrders() {
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await getJson(
      ENDPOINTS.MY_ORDERS(PAGE_SIZE, page * PAGE_SIZE),
      'Buyurtmalar yuklanmadi'
    );
    all.push(...(batch || []));
    if (!batch || batch.length < PAGE_SIZE) break;
  }
  return all.map(mapOrder);
}

/** Eng so'nggi buyurtmalar (yangisidan eskisiga) — bosh sahifadagi qisqa ko'rinish uchun. */
export async function getRecentOrders(limit = 30) {
  const batch = await getJson(ENDPOINTS.MY_ORDERS(limit, 0), 'Buyurtmalar yuklanmadi');
  return (batch || []).map(mapOrder);
}

// to'lov holati backendda yo'q bo'lishi mumkin (null) — bu xato emas.
const PAYMENT_STATE_TO_UI = { paid: 'paid', refunded: 'refunded' };

/** Bitta buyurtma tafsiloti + to'lov holati. */
export async function getOrderDetail(orderId) {
  const [detail, payment] = await Promise.all([
    getJson(ENDPOINTS.ORDER_DETAIL(orderId), 'Buyurtma yuklanmadi'),
    getJson(ENDPOINTS.ORDER_PAYMENT(orderId), 'To\'lov yuklanmadi').catch(() => null),
  ]);
  const order = mapOrder(detail);
  order.paymentStatus = PAYMENT_STATE_TO_UI[payment?.state] || 'not_charged';
  return order;
}

export async function createOrder(payload, idempotencyKey) {
  const res = await apiFetch(ENDPOINTS.ORDERS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // FastAPI 422 validatsiya xatolari odatda `detail` massivida keladi —
    // shu tafsilotlarni ko'rsatish sabab-oqibatni tezroq topishga yordam beradi.
    const detailMsg = Array.isArray(err.detail)
      ? err.detail.map((d) => `${(d.loc || []).slice(-1)[0]}: ${d.msg}`).join('; ')
      : err.detail;
    const e = new Error(err.message || detailMsg || 'Buyurtma yuborishda xatolik yuz berdi');
    e.status = res.status;
    throw e;
  }

  const json = await res.json();
  return json.response_data;
}

// ─── Kelishuv: chat, narx taklifi, kelishish, bekor qilish ───────────

async function postJson(url, body, fallbackMessage) {
  const res = await apiFetch(url, {
    method: 'POST',
    ...(body !== undefined
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detailMsg = Array.isArray(json.detail)
      ? json.detail.map((d) => d.msg).join('; ')
      : json.detail;
    const e = new Error(json.message || detailMsg || fallbackMessage);
    e.status = res.status;
    e.code = json.code ?? null;
    throw e;
  }
  return json.response_data;
}

// Chat xabari: sender_type 'customer' — mijozning o'zi (bu ilova mijoz uchun).
function mapChatMessage(m) {
  return {
    id: m.id,
    from: m.sender_type === 'customer' ? 'me' : m.sender_type,
    kind: m.kind,
    body: m.body ?? '',
    offerPrice: toNumber(m.offer_price),
    at: m.created_at,
  };
}

/**
 * Buyurtma chati. Mijoz buyurtmadagi barcha ustalar bilan suhbatlarni ko'radi (ustalar navbat bilan
 * kelishadi); `isActive` — hozirgi usta.
 * @returns {Promise<{ threads: object[], unread: number, canSend: boolean }>}
 */
export function mapChat(data) {
  return {
    threads: (data?.threads ?? []).map((t) => ({
      workerId: t.worker_id ?? null,
      workerName: t.worker_name ?? null,
      workerPhoto: t.worker_photo ?? null,
      isActive: !!t.is_active,
      messages: (t.messages ?? []).map(mapChatMessage),
    })),
    unread: data?.unread ?? 0,
    canSend: data?.can_send !== false,
  };
}

export async function getOrderChat(orderId) {
  return mapChat(await getJson(ENDPOINTS.ORDER_CHAT(orderId), 'Chat yuklanmadi'));
}

/** Xabar yuboradi; yangilangan butun chatni qaytaradi. */
export async function sendOrderChat(orderId, body) {
  return mapChat(await postJson(ENDPOINTS.ORDER_CHAT(orderId), { body }, 'Xabar yuborilmadi'));
}

export const markOrderChatRead = (orderId) =>
  postJson(ENDPOINTS.ORDER_CHAT_READ(orderId), undefined, "Chat o'qilmadi");

/** Narx taklif qiladi yoki qarshi narx aytadi (buyurtma ACCEPTED bosqichida). */
export const offerOrderPrice = (orderId, price) =>
  postJson(ENDPOINTS.ORDER_OFFER(orderId), { price }, 'Narx yuborilmadi');

/** Ustaning taklifini qabul qiladi: ACCEPTED → ACTIVE. */
export const agreeOrder = (orderId) =>
  postJson(ENDPOINTS.ORDER_AGREE(orderId), undefined, 'Kelishuv amalga oshmadi');

export const cancelOrderByCustomer = (orderId, reason) =>
  postJson(ENDPOINTS.ORDER_CANCEL(orderId), { reason }, 'Buyurtma bekor qilinmadi');
