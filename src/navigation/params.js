// Marshrut parametrlari faqat matn bo'lgani uchun ekranlararo uzatiladigan kichik obyektlar
// (usta, ish, buyurtma) JSON ko'rinishida `data` parametrida yuboriladi.
export const encodeParam = (value) => JSON.stringify(value ?? null);

export function decodeParam(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Ekranlarga o'tish uchun tayyor `href` obyektlari — manzillar shu yerda bitta joyda.
export const ustaRoute = (usta) => ({
  pathname: '/usta/[id]',
  params: { id: String(usta?.id ?? 'profil'), data: encodeParam(usta) },
});

export const workRoute = (work) => ({
  pathname: '/work',
  params: { data: encodeParam(work) },
});

export const orderRoute = (order) => ({
  pathname: '/order/[id]',
  params: { id: String(order?.id ?? 'buyurtma'), data: encodeParam(order) },
});

// Usta profilidan "Chaqirish": ustaga buyurtma berish oynasi (profil ustida ochiladi).
export const orderWorkerRoute = (worker) => ({
  pathname: '/order-worker',
  params: { worker: encodeParam(worker) },
});

export const newOrderRoute = (worker) => ({
  pathname: '/new-order',
  params: { worker: encodeParam(worker) },
});
