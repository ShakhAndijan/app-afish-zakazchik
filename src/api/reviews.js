import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

const AVATAR_COLORS = ['#ec4899', '#3b82f6', '#8b5cf6', '#2fa37a', '#e87a45', '#f5c451', '#06b6d4'];

export function mapTopComment(item, index) {
  const name = item.user?.full_name ?? '';
  return {
    name,
    initial: name?.[0]?.toUpperCase() ?? '?',
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    stars: item.rating ?? 0,
    text: item.comment ?? '',
    createdAt: item.created_at ?? null,
  };
}

export async function getTopComments({ limit = 10 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await apiFetch(ENDPOINTS.TOP_COMMENTS(limit), {
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Top comments fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return (json.response_data ?? []).map(mapTopComment);
}

// Bitta order_title — bitta ish. Har bir ishning bir nechta after_photo'si
// bo'lishi mumkin, shuning uchun ularni kartochka ichidagi karuselga beramiz.
//
// `top-orders` hozircha faqat sarlavha, usta, reyting, suratlar va yaratilgan sanani
// beradi. Quyidagi ixtiyoriy maydonlar backend qo'shganda ekranda o'zi paydo bo'ladi
// (kelmasa — null, ekran namunaviy qiymat + "Namuna ma'lumot" belgisini ko'rsatadi):
//   category{name}, district, completed_at, duration, price, review{text,rating,user}.
export function mapTopOrders(orders) {
  return orders.map((order, index) => ({
    id: order.public_token ?? String(index),
    publicToken: order.public_token ?? null,
    title: order.order_title ?? '',
    worker: order.worker?.full_name ?? '',
    workerId: order.worker?.id ?? null,
    rating: order.rating ?? 0,
    photos: order.after_photos ?? [],
    beforePhotos: order.before_photos ?? [],
    createdAt: order.created_at ?? null,
    completedAt: order.completed_at ?? null,
    category: order.category?.name ?? null,
    location: order.district ?? null,
    duration: order.duration ?? null,
    price: order.price ?? null,
    review: order.review ?? null,
  }));
}

// Ochiq (tokenli) buyurtma: haqiqiy kategoriya va yakunlangan sana.
export async function getPublicOrder(token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await apiFetch(ENDPOINTS.PUBLIC_ORDER(token), { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Public order fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return json.response_data ?? null;
}

export async function getTopOrders({ limit = 10 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await apiFetch(ENDPOINTS.TOP_ORDERS(limit), {
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Top orders fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return mapTopOrders(json.response_data ?? []);
}
