// "773682923" → "77 368 29 23" (davlat kodisiz 9 xonali raqam; to'liq bo'lmasa ham qismlarga bo'linadi).
export function formatPhone(raw) {
  const d = String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

export function stripCountryCode(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/^\+?998/, '')
    .trim();
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
