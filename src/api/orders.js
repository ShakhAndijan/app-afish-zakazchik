import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';
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
  const ext = String(uri || '')
    .split('?')[0]
    .split('.')
    .pop()
    .toLowerCase();
  return EXT_TO_TYPE[ext] || null;
}

/**
 * Buyurtma rasmi uchun bitta presigned URL so'raydi (har bir rasmga alohida).
 * @returns {Promise<{ upload_url: string, temp_key: string, expires_in: number }>}
 */
export const requestOrderPhotoUpload = (contentType) =>
  request(ENDPOINTS.ORDER_UPLOAD_URL, {
    method: 'POST',
    body: { content_type: contentType },
    fallbackMessage: 'Rasm yuklash manzili olinmadi',
  });

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

const getJson = (url, errorLabel) => request(url, { fallbackMessage: errorLabel });

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
    categoryIds: o.task_category_ids?.length
      ? o.task_category_ids
      : (o.category_id ?? o.category?.id) != null
        ? [o.category_id ?? o.category?.id]
        : [],
    service: o.category?.name ?? null,
    // Ish nomlari (tavsifdan olingan qisqa matnsiz) va mijoz yozgan to'liq tavsif.
    taskNames: taskNames.join(', '),
    description,
    master: workerName,
    workerId,
    // Telefon raqamlar narx kelishilgach ochiladi (backend shu paytgacha `worker.phone`ni bermaydi).
    workerPhone: o.worker?.phone ?? o.worker_phone ?? null,
    contactPhone: o.contact_phone ?? null,
    backupPhone: o.backup_phone ?? null,
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
    // Kelishuv to'xtatilgach buyurtma mijozga qaytadi (PENDING + returned_at): boshqa ustaga yuborish yoki ommaga chiqarish mumkin.
    returnedAt: o.returned_at ?? null,
    returnedBy: o.returned_by ?? null,
    returnedWorkerId: o.returned_worker_id ?? null,
    returnedWorkerName: o.returned_worker_name ?? null,
    returnedRecalled: !!o.returned_recalled,
    // Saytdagi kelishuv jarayoni uchun: kelib chiqishi, muddatlar, sana va takliflar.
    origin: o.origin ?? null,
    offersCount: o.offers_count ?? 0,
    chooseUntil: o.choose_until ?? null,
    confirmUntil: o.confirm_until ?? null,
    completeUntil: o.complete_until ?? null,
    workerDoneAt: o.worker_done_at ?? null,
    workNotDoneLeft: o.work_not_done_left ?? null,
    offerDate: o.offer_date ?? null,
    scheduledDate: o.scheduled_date ?? null,
    timingKind: o.timing_kind ?? null,
    budget,
    reposted: !!o.reposted,
    customerRated: !!o.customer_rated,
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
    getJson(ENDPOINTS.ORDER_PAYMENT(orderId), "To'lov yuklanmadi").catch(() => null),
  ]);
  const order = mapOrder(detail);
  order.paymentStatus = PAYMENT_STATE_TO_UI[payment?.state] || 'not_charged';
  return order;
}

// 422 validatsiya xatolarining maydon nomlari ApiError xabariga request() ichida qo'shiladi.
export const createOrder = (payload, idempotencyKey) =>
  request(ENDPOINTS.ORDERS, {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    body: payload,
    fallbackMessage: 'Buyurtma yuborishda xatolik yuz berdi',
  });

// ─── Kelishuv: chat, narx taklifi, kelishish, bekor qilish ───────────

const postJson = (url, body, fallbackMessage) =>
  request(url, { method: 'POST', body, fallbackMessage });

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

/**
 * Xabar yuboradi; yangilangan butun chatni qaytaradi. `workerId` — usta hali tanlanmagan ommaviy
 * buyurtmada aynan shu taklif egasiga yozish uchun (tanlashdan oldin gaplashish).
 */
export async function sendOrderChat(orderId, body, workerId) {
  const payload = workerId != null ? { body, worker_id: workerId } : { body };
  return mapChat(await postJson(ENDPOINTS.ORDER_CHAT(orderId), payload, 'Xabar yuborilmadi'));
}

export const markOrderChatRead = (orderId) =>
  postJson(ENDPOINTS.ORDER_CHAT_READ(orderId), undefined, "Chat o'qilmadi");

/** Narx (va ish sanasi, "YYYY-MM-DD") taklif qiladi yoki qarshi narx aytadi (ACCEPTED bosqichida). */
export const offerOrderPrice = (orderId, price, scheduledDate) =>
  postJson(
    ENDPOINTS.ORDER_OFFER(orderId),
    scheduledDate ? { price, scheduled_date: scheduledDate } : { price },
    'Narx yuborilmadi'
  );

/** Ustaning taklifini qabul qiladi: ACCEPTED → ACTIVE. */
export const agreeOrder = (orderId, scheduledDate) =>
  postJson(
    ENDPOINTS.ORDER_AGREE(orderId),
    scheduledDate ? { scheduled_date: scheduledDate } : undefined,
    'Kelishuv amalga oshmadi'
  );

/** Javob bermagan ustaga yuborilgan buyurtmani qaytarib oladi (PENDING). */
export const recallOrder = (orderId) =>
  postJson(ENDPOINTS.ORDER_RECALL(orderId), undefined, 'Buyurtma qaytarib olinmadi');

/**
 * Bekor qilingan buyurtmani qayta e'lon qiladi. `payload`: { timing_kind?, scheduled_date?, budget? }.
 */
export const repostOrder = (orderId, payload) =>
  postJson(ENDPOINTS.ORDER_REPOST(orderId), payload ?? {}, "Buyurtma qayta e'lon qilinmadi");

/** Ish bajarilganini tasdiqlaydi (ACTIVE → COMPLETED); yakuniy izoh ixtiyoriy. */
export const completeOrder = (orderId, comment) =>
  postJson(
    ENDPOINTS.ORDER_COMPLETE(orderId),
    { agreed_price: null, comment: comment || null },
    'Buyurtma yakunlanmadi'
  );

/** "Ish hali bajarilmadi": ustaga xabar boradi, buyurtma o'z-o'zidan yakunlanmaydi. */
export const workNotDone = (orderId) =>
  postJson(ENDPOINTS.ORDER_WORK_NOT_DONE(orderId), undefined, 'Amal bajarilmadi');

// Ommaviy buyurtmaga kelgan takliflar (faqat PENDING, ustasiz buyurtma uchun).
function mapOffer(o) {
  const w = o.worker ?? {};
  return {
    id: o.id,
    status: o.status,
    price: toNumber(o.price),
    priceBy: o.price_by ?? null,
    offerDate: o.offer_date ?? null,
    arrival: o.arrival ?? null,
    comment: o.comment ?? null,
    createdAt: o.created_at,
    worker: {
      id: w.id ?? null,
      name: w.full_name ?? '',
      photo: w.profile_photo ?? null,
      verified: !!w.is_identity_verified,
      rating: toNumber(w.overall_rating),
      reviews: w.review_count ?? 0,
      jobs: w.completed_jobs ?? 0,
      experience: w.experience_years ?? 0,
    },
  };
}

export async function getOrderOffers(orderId) {
  const list = await getJson(ENDPOINTS.ORDER_OFFERS(orderId), 'Takliflar yuklanmadi');
  return (list || []).map(mapOffer);
}

/** Taklifni tanlaydi — usta kelishuvni tasdiqlashi kutiladi (buyurtma ACCEPTED bo'ladi). */
export const chooseOrderOffer = (orderId, offerId) =>
  postJson(ENDPOINTS.ORDER_OFFER_CHOOSE(orderId, offerId), undefined, 'Taklif tanlanmadi');

/** Ustaning taklifiga qarshi narx aytadi; usta shu taklifni tasdiqlasa, kelishuv tuziladi. */
export const repriceOrderOffer = (orderId, offerId, price) =>
  postJson(ENDPOINTS.ORDER_OFFER_PRICE(orderId, offerId), { price }, 'Narx yuborilmadi');

export const rejectOrderOffer = (orderId, offerId) =>
  postJson(ENDPOINTS.ORDER_OFFER_REJECT(orderId, offerId), undefined, 'Taklif rad etilmadi');

/** Kelishuvni rad etadi (sabab bilan): kelishuv to'xtaydi, buyurtma mijozga qaytadi. */
export const declineOrder = (orderId, reason) =>
  postJson(ENDPOINTS.ORDER_DECLINE(orderId), { reason }, 'Kelishuv rad etilmadi');

/** Qaytgan buyurtmani boshqa mutaxassisga yuboradi. */
export const sendOrderTo = (orderId, workerId) =>
  postJson(ENDPOINTS.ORDER_SEND_TO(orderId), { worker_id: workerId }, 'Buyurtma yuborilmadi');

/** Qaytgan buyurtmani umumiy ro'yxatga chiqaradi (mos ustalar narx taklif qiladi). */
export const publishOrder = (orderId) =>
  postJson(ENDPOINTS.ORDER_PUBLISH(orderId), undefined, "Buyurtma ro'yxatga chiqarilmadi");

export const cancelOrderByCustomer = (orderId, reason) =>
  postJson(ENDPOINTS.ORDER_CANCEL(orderId), { reason }, 'Buyurtma bekor qilinmadi');
