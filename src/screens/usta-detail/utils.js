// Android'dagi Image (Fresco/OkHttp) kodlanmagan "+" belgisini URL'da
// noto'g'ri talqin qilib, rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
export const encodeImageUri = (uri) => (uri ? uri.replace(/\+/g, '%2B') : uri);

// Backend ulushlarni 0..1 oralig'ida beradi ("0.97"), ba'zan foizda; ikkalasi ham foizga o'giriladi.
export const ratePercent = (v) => Math.round(v <= 1 ? v * 100 : v);

// Daqiqalarni "45 daq" / "5 soat" / "3 kun" ko'rinishiga o'giradi.
export function formatDuration(tr, minutes) {
  if (minutes < 60) return tr('ustaDetail.time.min', { n: Math.max(1, Math.round(minutes)) });
  if (minutes < 1440) return tr('ustaDetail.time.hour', { n: Math.round(minutes / 60) });
  return tr('ustaDetail.time.day', { n: Math.round(minutes / 1440) });
}

const pad2 = (n) => String(n).padStart(2, '0');

// ISO sana → "05.10.2026" (noto'g'ri yoki bo'sh bo'lsa — '').
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}
