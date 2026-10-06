function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Kartada bosilgan nuqtaga eng yaqin markazga ega viloyat/tumanni topadi —
// backend har bir viloyat/tuman uchun o'z markaziy koordinatasini beradi,
// shuning uchun bu Yandex geokoderi qaytargan matnli nomga qaraganda
// ishonchliroq (til/imlo farqiga bog'liq emas).
export function findNearestByCoords(list, lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const item of list) {
    const itemLat = Number(item.latitude);
    const itemLng = Number(item.longitude);
    if (!Number.isFinite(itemLat) || !Number.isFinite(itemLng)) continue;
    const dist = haversineKm(lat, lng, itemLat, itemLng);
    if (dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

export function stripCountryCode(raw) {
  if (!raw) return '';
  return String(raw).replace(/^\+?998/, '').trim();
}

export function formatMoney(value) {
  if (!value) return '';
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatWhenDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${dd}.${mm} ${hh}:${mi}`;
}

export function toISODate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
