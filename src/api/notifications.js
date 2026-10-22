import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

/**
 * Bildirishnomalar ro'yxati (yangisi birinchi).
 * Element: `{ id, type, payload, isRead, createdAt }`; `type` — "order.accepted", "listing.commented" kabi.
 */
export async function getNotificationsPage({ page = 1, size = 15 } = {}) {
  const data = await request(ENDPOINTS.NOTIFICATIONS(page, size), {
    fallbackMessage: 'Bildirishnomalar yuklanmadi',
  });
  return {
    items: (data?.items ?? []).map((n) => ({
      id: n.id,
      type: n.type ?? '',
      payload: n.payload ?? {},
      isRead: !!n.is_read,
      createdAt: n.created_at ?? null,
    })),
    pages: data?.pagination?.pages ?? 1,
  };
}

export async function getUnreadNotificationCount() {
  const data = await request(ENDPOINTS.NOTIFICATIONS_UNREAD, {
    fallbackMessage: 'Bildirishnomalar soni yuklanmadi',
  });
  return Math.max(0, Number(data?.count) || 0);
}

/** Bittasini o'qilgan deb belgilaydi; qolgan o'qilmaganlar sonini qaytaradi. */
export async function markNotificationRead(id) {
  const data = await request(ENDPOINTS.NOTIFICATION_READ(id), {
    method: 'PATCH',
    fallbackMessage: "Bildirishnoma o'qilmadi",
  });
  return Math.max(0, Number(data?.count) || 0);
}

/** Hammasini o'qilgan deb belgilaydi; o'qilmaganlar sonini qaytaradi (odatda 0). */
export async function markAllNotificationsRead() {
  const data = await request(ENDPOINTS.NOTIFICATIONS_READ_ALL, {
    method: 'POST',
    fallbackMessage: "Bildirishnomalar o'qilmadi",
  });
  return Math.max(0, Number(data?.count) || 0);
}
