import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Korporativ hisob (saytdagi /biznes va kabinet "Компания"): ariza, obyektlar, doimiy xizmat (reja),
// xodimlar va oylik hisobot. Barcha o'zgartiruvchi so'rovlar yangilangan `BusinessMeOut` qaytaradi.

export const ORG_KINDS = ['office', 'restaurant', 'hoa', 'shop', 'hotel', 'other'];
export const PLAN_FREQUENCIES = [
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'semiannual',
  'yearly',
];
export const MEMBER_ROLES = ['manager', 'accountant'];

const mapOrg = (o) =>
  o && {
    id: o.id,
    name: o.name ?? '',
    kind: o.kind,
    tin: o.tin ?? '',
    legalAddress: o.legal_address ?? '',
    contactName: o.contact_name ?? '',
    contactPhone: o.contact_phone ?? '',
    email: o.email ?? '',
    needs: o.needs ?? '',
    status: o.status, // pending | approved | rejected
    adminNote: o.admin_note ?? null,
    decidedAt: o.decided_at ?? null,
    createdAt: o.created_at ?? null,
  };

const mapSite = (s) => ({
  id: s.id,
  name: s.name ?? '',
  regionId: s.region_id ?? null,
  districtId: s.district_id ?? null,
  region: s.region ?? '',
  district: s.district ?? '',
  address: s.address ?? '',
  landmark: s.landmark ?? '',
  contactPhone: s.contact_phone ?? '',
  isActive: !!s.is_active,
});

const mapPlan = (p) => ({
  id: p.id,
  siteId: p.site_id,
  categoryId: p.category_id,
  category: p.category ?? '',
  workerId: p.worker_id ?? null,
  workerName: p.worker_name ?? null,
  description: p.description ?? '',
  frequency: p.frequency,
  nextDate: p.next_date ?? null,
  orderOn: p.order_on ?? null,
  isActive: !!p.is_active,
  ordersPlaced: Number(p.orders_placed) || 0,
});

const mapMember = (m) => ({
  id: m.id,
  phone: m.phone ?? '',
  name: m.name ?? '',
  role: m.role,
  joined: !!m.joined,
});

/**
 * `{ organization|null, sites, plans, members, role }`. `role` — xodim bo'lsa 'manager' | 'accountant',
 * egasi uchun boshqa qiymat (yoki null); `isOwner` shundan chiqariladi.
 */
function mapMe(data) {
  const organization = mapOrg(data?.organization) ?? null;
  const role = data?.role ?? null;
  return {
    organization,
    role,
    isOwner: !!organization && !MEMBER_ROLES.includes(role),
    sites: (data?.sites ?? []).map(mapSite),
    plans: (data?.plans ?? []).map(mapPlan),
    members: (data?.members ?? []).map(mapMember),
  };
}

const call = async (url, { fallbackMessage, ...opts } = {}) =>
  mapMe(await request(url, { fallbackMessage: fallbackMessage ?? 'So‘rov bajarilmadi', ...opts }));

export const getBusiness = () =>
  call(ENDPOINTS.BUSINESS_ME, { fallbackMessage: 'Kompaniya yuklanmadi' });

const orgBody = (f) => ({
  name: f.name.trim(),
  kind: f.kind,
  tin: f.tin?.trim() || null,
  legal_address: f.legalAddress?.trim() || null,
  contact_name: f.contactName.trim(),
  contact_phone: f.contactPhone.trim(),
  email: f.email?.trim() || null,
  needs: f.needs?.trim() || null,
});

/** Ariza (yoki rad etilgandan keyin qayta ariza). 409 `business_exists`. */
export const applyBusiness = (form) =>
  call(ENDPOINTS.BUSINESS_APPLY, { method: 'POST', body: orgBody(form) });

/** Ma'lumotlarni o'zgartirish (nom, tur va STIR — faqat ko'rib chiqilayotganda). */
export const updateBusiness = (form) =>
  call(ENDPOINTS.BUSINESS_ME, { method: 'PATCH', body: orgBody(form) });

const siteBody = (f) => ({
  name: f.name.trim(),
  region_id: f.regionId ?? null,
  district_id: f.districtId ?? null,
  address: f.address.trim(),
  landmark: f.landmark?.trim() || null,
  contact_phone: f.contactPhone?.trim() || null,
});

export const createSite = (form) =>
  call(ENDPOINTS.BUSINESS_SITES, { method: 'POST', body: siteBody(form) });

export const updateSite = (id, form) =>
  call(ENDPOINTS.BUSINESS_SITE(id), { method: 'PATCH', body: siteBody(form) });

/** Obyektni yopish/qayta ochish; yopilganda uning doimiy xizmati ham to'xtaydi. */
export const setSiteActive = (id, isActive) =>
  call(ENDPOINTS.BUSINESS_SITE(id), { method: 'PATCH', body: { is_active: isActive } });

const planBody = (f) => ({
  site_id: f.siteId,
  category_id: f.categoryId,
  description: f.description.trim(),
  frequency: f.frequency,
  next_date: f.nextDate,
});

/** 400 `business_plan_date_past`, `business_site_closed`. */
export const createPlan = (form) =>
  call(ENDPOINTS.BUSINESS_PLANS, { method: 'POST', body: planBody(form) });

export const updatePlan = (id, form) =>
  call(ENDPOINTS.BUSINESS_PLAN(id), { method: 'PATCH', body: planBody(form) });

export const setPlanActive = (id, isActive) =>
  call(ENDPOINTS.BUSINESS_PLAN(id), { method: 'PATCH', body: { is_active: isActive } });

/** Reja o'chadi, u qo'ygan buyurtmalar qoladi. */
export const deletePlan = (id) => call(ENDPOINTS.BUSINESS_PLAN(id), { method: 'DELETE' });

/** Xodim telefon bo'yicha (+998XXXXXXXXX). 409 `business_member_exists` | `business_member_elsewhere`. */
export const addMember = ({ phone, role, name }) =>
  call(ENDPOINTS.BUSINESS_MEMBERS, {
    method: 'POST',
    body: { phone, role, name: name?.trim() || null },
  });

export const updateMember = (id, role) =>
  call(ENDPOINTS.BUSINESS_MEMBER(id), { method: 'PATCH', body: { role } });

export const removeMember = (id) => call(ENDPOINTS.BUSINESS_MEMBER(id), { method: 'DELETE' });

/** Xodim kompaniyadan chiqadi. 409 `business_owner_cannot_leave`. */
export const leaveBusiness = () => call(ENDPOINTS.BUSINESS_LEAVE, { method: 'POST', body: {} });

/** Oylik hisobot (`YYYY-MM`): bajarilgan ishlar obyekt va yo'nalish bo'yicha. */
export async function getStatement(period) {
  const d = await request(ENDPOINTS.BUSINESS_STATEMENT(period), {
    fallbackMessage: 'Hisobot yuklanmadi',
  });
  const group = (g) => ({
    name: g.name ?? '',
    jobs: Number(g.jobs) || 0,
    total: Number(g.total) || 0,
  });
  return {
    period: d?.period ?? null,
    jobs: Number(d?.jobs) || 0,
    total: Number(d?.total) || 0,
    inProgress: Number(d?.in_progress) || 0,
    bySite: (d?.by_site ?? []).map(group),
    byCategory: (d?.by_category ?? []).map(group),
    rows: (d?.rows ?? []).map((r) => ({
      orderId: r.order_id,
      code: r.code ?? '',
      completedAt: r.completed_at ?? null,
      site: r.site ?? '',
      category: r.category ?? '',
      worker: r.worker ?? '',
      price: r.price != null ? Number(r.price) : null,
      fromPlan: !!r.from_plan,
    })),
  };
}
