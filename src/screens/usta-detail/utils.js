// Android'dagi Image (Fresco/OkHttp) kodlanmagan "+" belgisini URL'da
// noto'g'ri talqin qilib, rasmni yuklolmasligi mumkin — shu sababli xavfsiz kodlaymiz.
export const encodeImageUri = (uri) => (uri ? uri.replace(/\+/g, '%2B') : uri);

const pad2 = (n) => String(n).padStart(2, '0');

// ISO sana → "05.10.2026" (noto'g'ri yoki bo'sh bo'lsa — '').
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}
