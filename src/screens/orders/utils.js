const pad2 = (n) => String(n).padStart(2, '0');

// "5-Iyn, 10:30" — oy nomlari tarjima fayllaridan olinadi.
export function formatOrderDate(iso, tr) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = tr('orders.monthsShort');
  const month = Array.isArray(months) ? months[d.getMonth()] : String(d.getMonth() + 1);
  return `${d.getDate()}-${month}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// 2.5 → "2.5", 3 → "3"
export const formatHours = (h) => String(parseFloat(h.toFixed(2)));
