export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const AVATAR_COLORS = ['#2fa37a', '#e87a45', '#3f7fd4', '#9b6cd1', '#f5c451', '#ec4899'];

// Ismning birinchi harfiga qarab barqaror avatar rangi.
export function colorForName(name) {
  const code = name ? name.charCodeAt(0) : 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// 1234567 → "1 234 567"
export function formatPrice(n) {
  return n.toLocaleString('ru-RU');
}
