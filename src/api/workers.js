import { ENDPOINTS } from '../constants/config';

const AVATAR_COLORS = ['#2fa37a', '#e87a45', '#3f7fd4', '#ec4899', '#8b5cf6', '#f5c451', '#06b6d4'];

const formatPrice = (price) =>
  String(Math.round(parseFloat(price))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Backenddan kelgan worker obyektini UI formatiga o'giradi */
export function mapWorker(w) {
  return {
    id: w.id,
    name: `${w.first_name} ${w.last_name}`,
    initial: w.first_name?.[0]?.toUpperCase() ?? '?',
    color: AVATAR_COLORS[w.id % AVATAR_COLORS.length],
    profile_photo: w.profile_photo ?? null,
    profession: w.bio?.split(/[.,،]/)[0]?.trim() ?? '',
    rating: parseFloat(w.overall_rating ?? '0'),
    location: [w.district, w.region].filter(Boolean).join(', '),
    experience: `${w.experience_years} yil`,
    startingPrice: formatPrice(w.min_price ?? '0'),
    is_online: w.is_online ?? false,
    reliability_badge: w.reliability_badge ?? 'none',
    vip_status: w.vip_status ?? 'none',
  };
}

/**
 * @param {{ limit?: number, offset?: number }} params
 * @returns {Promise<ReturnType<mapWorker>[]>}
 */
export async function getWorkers({ limit = 5, offset = 0 } = {}) {
  const url = `${ENDPOINTS.WORKERS}?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });

  if (!res.ok) {
    throw new Error(`Workers fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return (json.response_data ?? []).map(mapWorker);
}
