// Reyting, tasdiqlangan, hudud, qidiruv (q) va "arzon" tartibi serverda (GET /workers) qo'llanadi.
// Backendda minimal tajriba filtri va "qimmat" tartibi yo'q, shuning uchun ular
// yuklangan ro'yxatda mijoz tomonda bajariladi.
export function applyAdvFilters(list, { sort, minExp }) {
  let arr = [...list];
  if (minExp) arr = arr.filter((w) => w.experienceYears >= minExp);
  if (sort === 'arzon') arr.sort((a, b) => a.minPrice - b.minPrice);
  if (sort === 'qimmat') arr.sort((a, b) => b.minPrice - a.minPrice);
  return arr;
}

export function avgExperience(list) {
  if (!list.length) return '—';
  return Math.round(list.reduce((s, w) => s + (w.experienceYears || 0), 0) / list.length);
}

/** Worker (mapWorker) obyektini ListingCard formatiga o'giradi */
export function toListingCardShape(w, tr) {
  return {
    ...w,
    title: w.profession || tr('xizmatlar.defaultWorkerTitle'),
    desc: w.bio || '',
    price: w.minPrice ?? 0,
    certified: w.isIdentityVerified,
    postedAgo: null,
  };
}
