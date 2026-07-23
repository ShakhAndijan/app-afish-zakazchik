import { ENDPOINTS } from '../constants/config';
import { apiFetch } from '../utils/apiClient';

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
 * @param {{ limit?: number, offset?: number, categoryId?: number|string|null }} params
 * @returns {Promise<ReturnType<mapWorker>[]>}
 */
export async function getWorkers({ limit = 5, offset = 0, categoryId } = {}) {
  const params = `limit=${limit}&offset=${offset}`;
  const url = categoryId
    ? `${ENDPOINTS.WORKERS}?category_id=${categoryId}&${params}`
    : `${ENDPOINTS.WORKERS}?${params}`;
  const res = await apiFetch(url);

  if (!res.ok) {
    throw new Error(`Workers fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return (json.response_data ?? []).map(mapWorker);
}

/**
 * @param {{ page?: number, size?: number }} params
 * @returns {Promise<ReturnType<mapWorker>[]>}
 */
export async function getFavorites({ page = 1, size = 10 } = {}) {
  const res = await apiFetch(ENDPOINTS.CUSTOMER_FAVORITES(page, size));

  if (!res.ok) {
    throw new Error(`Favorites fetch failed: ${res.status}`);
  }

  const json = await res.json();
  console.log('[getFavorites] /customers/me/favorites response:', json.response_data);
  return (json.response_data?.items ?? []).map(mapWorker);
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
  const primary =
    mappedCategories.find((c) => c.isPrimary) ?? mappedCategories[0] ?? null;
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
    experience: `${w.experience_years ?? 0} yil`,
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
    categories: mappedCategories,
    portfolio: (w.portfolio ?? []).map(mapPortfolioItem),
    certificates: (w.certificates ?? []).map(mapCertificate),
    schedule: mapSchedule(w.schedule),
  };
}

/**
 * @param {number|string} workerId
 * @returns {Promise<ReturnType<mapWorkerDetail>>}
 */
export async function getWorkerById(workerId) {
  const res = await apiFetch(ENDPOINTS.WORKER_DETAIL(workerId));

  if (!res.ok) {
    throw new Error(`Worker detail fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return mapWorkerDetail(json.response_data);
}

/**
 * @param {number|string} workerId
 * @param {number|string|null} [categoryId]
 * @returns {Promise<ReturnType<mapCertificate>[]>}
 */
export async function getWorkerCertificates(workerId, categoryId) {
  const res = await apiFetch(ENDPOINTS.WORKER_CERTIFICATES(workerId, categoryId));

  if (!res.ok) {
    throw new Error(`Worker certificates fetch failed: ${res.status}`);
  }

  const json = await res.json();
  return (json.response_data ?? []).map(mapCertificate);
}
