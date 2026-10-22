import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';
import { devLog } from '../utils/log';

export const AVATAR_COLORS = [
  '#2fa37a',
  '#e87a45',
  '#3f7fd4',
  '#ec4899',
  '#8b5cf6',
  '#f5c451',
  '#06b6d4',
];

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
    bio: w.bio ?? '',
    rating: parseFloat(w.overall_rating ?? '0'),
    location: [w.district, w.region].filter(Boolean).join(', '),
    experienceYears: w.experience_years ?? 0,
    startingPrice: formatPrice(w.min_price ?? '0'),
    minPrice: parseFloat(w.min_price ?? '0'),
    is_online: w.is_online ?? false,
    isIdentityVerified: !!w.is_identity_verified,
    reliability_badge: w.reliability_badge ?? 'none',
    vip_status: w.vip_status ?? 'none',
    reviewCount: w.review_count ?? 0,
    // Joylashuv kiritilmagan ustalar uchun null; `distanceKm` faqat near_lat/near_lon bilan so'ralganda keladi.
    latitude: w.latitude != null ? Number(w.latitude) : null,
    longitude: w.longitude != null ? Number(w.longitude) : null,
    distanceKm: w.distance_km != null ? Number(w.distance_km) : null,
    mainCategory: w.main_category?.name ?? '',
    categoryId: w.main_category?.id ?? null,
    skills: Array.isArray(w.skills) ? w.skills : [],
  };
}

/**
 * @param {{ page?: number, size?: number, categoryId?: number|string|null, sort?: string,
 *   regionId?: number|null, districtId?: number|null, minRating?: number|null,
 *   verifiedOnly?: boolean, isOnline?: boolean, badge?: 'gold'|'silver'|'bronze'|null, q?: string,
 *   nearLat?: number|null, nearLon?: number|null }} params
 * `sort`: 'rating' | 'price' | 'newest' | 'experience' | 'distance' ('distance' faqat nearLat/nearLon bilan).
 * @returns {Promise<ReturnType<mapWorker>[]>}
 */
export async function getWorkers(params) {
  return (await getWorkersPage(params)).items;
}

/**
 * Xuddi getWorkers, lekin sahifalashdagi umumiy sonni (`pagination.total`) ham qaytaradi.
 * @returns {Promise<{ items: ReturnType<mapWorker>[], total: number|null }>}
 */
export async function getWorkersPage({
  page = 1,
  size = 5,
  categoryId,
  sort = 'rating',
  regionId,
  districtId,
  minRating,
  verifiedOnly,
  isOnline,
  badge,
  q,
  nearLat,
  nearLon,
  covers,
} = {}) {
  const params = [`sort=${sort}`, `page=${page}`, `size=${size}`];
  if (q?.trim()) params.push(`q=${encodeURIComponent(q.trim().slice(0, 100))}`);
  if (categoryId) params.push(`category_id=${categoryId}`);
  if (regionId) params.push(`region_id=${regionId}`);
  if (districtId) params.push(`district_id=${districtId}`);
  if (minRating) params.push(`min_rating=${minRating}`);
  if (verifiedOnly) params.push('is_verified=true');
  if (isOnline) params.push('is_online=true');
  if (badge) params.push(`badge=${badge}`);
  // `covers`: buyurtma yo'nalishlari (vergul bilan) — shularni bajaradigan ustalar.
  if (covers) params.push(`covers=${covers}`);
  if (nearLat != null && nearLon != null) params.push(`near_lat=${nearLat}`, `near_lon=${nearLon}`);
  const data = await request(`${ENDPOINTS.WORKERS}?${params.join('&')}`, {
    fallbackMessage: "Ustalar ro'yxati yuklanmadi",
  });
  const items = data?.items ?? data ?? [];
  return {
    items: items.map(mapWorker),
    total: data?.pagination?.total ?? null,
  };
}

/**
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<ReturnType<mapWorker>[]>}
 */
export async function getFavorites({ page = 1, size = 10 } = {}) {
  const data = await request(ENDPOINTS.CUSTOMER_FAVORITES(page, size), {
    fallbackMessage: 'Sevimlilar yuklanmadi',
  });
  devLog('[getFavorites] /customers/me/favorites response:', data);
  return (data?.items ?? []).map(mapWorker);
}

/** Sevimli ustalar (jami soni bilan): `{ items, total }`. */
export async function getFavoritesPage({ page = 1, size = 20 } = {}) {
  const data = await request(ENDPOINTS.CUSTOMER_FAVORITES(page, size), {
    fallbackMessage: 'Sevimlilar yuklanmadi',
  });
  return {
    items: (data?.items ?? []).map(mapWorker),
    total: data?.pagination?.total ?? 0,
  };
}

/** Sevimli ustalar soni (sahifalashdagi `total`, faqat 1 ta element so'raladi). */
export async function getFavoritesCount() {
  const data = await request(ENDPOINTS.CUSTOMER_FAVORITES(1, 1), {
    fallbackMessage: 'Sevimlilar soni yuklanmadi',
  });
  return data?.pagination?.total ?? 0;
}

function mapWorkerCategory(c) {
  return {
    id: c.id,
    categoryId: c.category?.id ?? null,
    name: c.category?.name ?? 'Xizmat',
    isPrimary: !!c.is_primary,
    experience: c.experience_years,
    price: c.price != null ? formatPrice(c.price) : null,
    minPrice: c.min_price != null ? formatPrice(c.min_price) : null,
    currency: c.currency ?? 'UZS',
    isNegotiable: !!c.is_negotiable,
  };
}

function mapPortfolioItem(p) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    photo: p.photos?.[0] ?? null,
    photos: p.photos ?? [],
    rating: p.rating ?? null,
    comment: p.comment ?? '',
    workDate: p.work_date,
  };
}

function mapCertificate(c) {
  return {
    id: c.id,
    title: c.title,
    issuedBy: c.issued_by,
    issuedAt: c.issued_at,
    expiresAt: c.expires_at,
    category: c.category?.name ?? null,
  };
}

/** Backenddan kelgan ish kunini UI formatiga o'giradi */
function mapWorkDay(d) {
  return {
    id: d.id,
    name: d.name,
    workStart: d.work_start,
    workEnd: d.work_end,
  };
}

function mapSchedule(s) {
  if (!s) return null;
  return {
    workingDays: (s.working_days ?? []).map(mapWorkDay),
    daysOff: (s.days_off ?? []).map((d) => ({ id: d.id, name: d.name })),
    offDates: s.off_dates ?? [],
    timezone: s.timezone ?? null,
  };
}

/** Backenddan kelgan worker detail obyektini UI formatiga o'giradi */
export function mapWorkerDetail(w) {
  const mappedCategories = (w.categories ?? []).map(mapWorkerCategory);
  const primary = mappedCategories.find((c) => c.isPrimary) ?? mappedCategories[0] ?? null;
  const ratingBreakdown = w.rating_breakdown ?? null;

  return {
    id: w.id,
    name: `${w.first_name} ${w.last_name}`,
    initial: w.first_name?.[0]?.toUpperCase() ?? '?',
    color: AVATAR_COLORS[w.id % AVATAR_COLORS.length],
    profile_photo: w.profile_photo ?? null,
    bio: w.bio ?? '',
    trade: w.main_category?.name ?? primary?.name ?? '',
    profession: w.main_category?.name ?? primary?.name ?? '',
    mainCategoryId: w.main_category?.id ?? primary?.categoryId ?? null,
    location: [w.district, w.region].filter(Boolean).join(', '),
    rating: parseFloat(w.overall_rating ?? '0'),
    reliability_badge: w.reliability_badge ?? 'none',
    is_online: w.is_online ?? false,
    isIdentityVerified: !!w.is_identity_verified,
    experienceYears: w.experience_years ?? 0,
    vip_status: w.vip_status ?? 'none',
    acceptanceRate: w.acceptance_rate != null ? parseFloat(w.acceptance_rate) : null,
    repeatClientRate: w.repeat_client_rate != null ? parseFloat(w.repeat_client_rate) : null,
    avgResponseMin: w.avg_response_min ?? null,
    languages: (w.languages ?? [])
      .map((l) => (typeof l === 'string' ? l : l?.name))
      .filter(Boolean),
    reviewCount: w.review_count ?? 0,
    completedJobsCount: w.completed_jobs_count ?? 0,
    ratingBreakdown: ratingBreakdown && {
      5: ratingBreakdown.five ?? 0,
      4: ratingBreakdown.four ?? 0,
      3: ratingBreakdown.three ?? 0,
      2: ratingBreakdown.two ?? 0,
      1: ratingBreakdown.one ?? 0,
    },
    startingPrice: primary?.minPrice ?? primary?.price ?? '0',
    isLiked: !!(w.is_liked ?? w.is_favorite),
    categories: mappedCategories,
    portfolio: (w.portfolio ?? []).map(mapPortfolioItem),
    certificates: (w.certificates ?? []).map(mapCertificate),
    schedule: mapSchedule(w.schedule),
    registeredAt: w.registered_at ?? null,
    // Ishlash hududi: radius (km) yoki alohida tumanlar ro'yxati.
    workAreaMode: w.work_area_mode ?? null,
    workRadiusKm: w.work_radius_km ?? null,
    workDistricts: (w.work_districts ?? [])
      .map((d) => (typeof d === 'string' ? d : d?.name))
      .filter(Boolean),
  };
}

/**
 * @param {number|string} workerId
 * @returns {Promise<ReturnType<mapWorkerDetail>>}
 */
export async function getWorkerById(workerId) {
  const data = await request(ENDPOINTS.WORKER_DETAIL(workerId), {
    fallbackMessage: "Usta ma'lumoti yuklanmadi",
  });
  devLog('[getWorkerById] /workers/{id} response:', data);
  return mapWorkerDetail(data);
}

/**
 * @param {number|string} workerId
 */
export async function likeWorker(workerId) {
  await request(ENDPOINTS.WORKER_LIKE(workerId), {
    method: 'POST',
    fallbackMessage: "Sevimlilarga qo'shib bo'lmadi",
  });
}

/**
 * @param {number|string} workerId
 */
export async function unlikeWorker(workerId) {
  await request(ENDPOINTS.WORKER_LIKE(workerId), {
    method: 'DELETE',
    fallbackMessage: "Sevimlilardan olib tashlab bo'lmadi",
  });
}

/**
 * @param {number|string} workerId
 * @param {number|string|null} [categoryId]
 * @returns {Promise<ReturnType<mapCertificate>[]>}
 */
export async function getWorkerCertificates(workerId, categoryId) {
  const data = await request(ENDPOINTS.WORKER_CERTIFICATES(workerId, categoryId), {
    fallbackMessage: 'Sertifikatlar yuklanmadi',
  });
  devLog('[getWorkerCertificates] /workers/{id}/certificates response:', data);
  return (data ?? []).map(mapCertificate);
}
