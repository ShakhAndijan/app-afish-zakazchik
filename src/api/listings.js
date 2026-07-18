import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

const AVATAR_COLORS = ['#2fa37a', '#e87a45', '#3f7fd4', '#ec4899', '#8b5cf6', '#f5c451', '#06b6d4'];

function timeAgo(dateStr) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (minutes < 1) return 'hozirgina';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  return `${Math.floor(days / 30)} oy oldin`;
}

/** Backenddan kelgan listing obyektini UI (ListingCard) formatiga o'giradi */
export function mapListing(item) {
  const worker = item.worker ?? {};
  const name = [worker.first_name, worker.last_name].filter(Boolean).join(' ');

  return {
    id: item.id,
    workerId: worker.id,
    initial: worker.first_name?.[0]?.toUpperCase() ?? '?',
    name,
    color: AVATAR_COLORS[(worker.id ?? item.id ?? 0) % AVATAR_COLORS.length],
    profile_photo: worker.profile_photo ?? null,
    rating: parseFloat(worker.overall_rating ?? '0'),
    price: parseFloat(item.price ?? '0'),
    postedAgo: timeAgo(item.created_at),
    title: item.title ?? '',
    desc: item.description ?? '',
    photos: item.photos ?? [],
    reliability_badge: worker.reliability_badge ?? 'none',
    is_online: worker.is_online ?? false,
  };
}

/**
 * @param {{ limit?: number, offset?: number }} params
 * @returns {Promise<ReturnType<mapListing>[]>}
 */
export async function getListings({ limit = 10, offset = 0 } = {}) {
  const res = await apiFetch(ENDPOINTS.LISTINGS(limit, offset));

  if (!res.ok) {
    throw new Error(`Listings fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return (json.response_data ?? []).map(mapListing);
}
