import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

const AVATAR_COLORS = ['#ec4899', '#3b82f6', '#8b5cf6', '#2fa37a', '#e87a45', '#f5c451', '#06b6d4'];

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Bugun';
  if (days === 1) return 'Kecha';
  if (days < 7) return `${days} kun oldin`;
  if (days < 30) return `${Math.floor(days / 7)} hafta oldin`;
  return `${Math.floor(days / 30)} oy oldin`;
}

export function mapTopComment(item, index) {
  const name = item.user?.full_name ?? '';
  return {
    name,
    initial: name?.[0]?.toUpperCase() ?? '?',
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    stars: item.rating ?? 0,
    text: item.comment ?? '',
    location: timeAgo(item.created_at),
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
export function mapTopOrders(orders) {
  return orders.map((order, index) => ({
    id: String(index),
    title: order.order_title ?? '',
    worker: order.worker?.full_name ?? '',
    rating: order.rating ?? 0,
    photos: order.after_photos ?? [],
  }));
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
