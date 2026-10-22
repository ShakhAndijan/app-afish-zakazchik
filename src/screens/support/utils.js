// Saytdagi qo'llab-quvvatlash formasidagi "Aloqa uchun" tekshiruvi: telefon (+998XXXXXXXXX),
// email yoki @telegram. To'g'ri bo'lsa `{ value, kind }`, bo'lmasa `null`.
const PHONE_RE = /^\+998\d{9}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/;
const TELEGRAM_RE = /^@[A-Za-z0-9_]{5,32}$/;

export function parseContact(input) {
  const text = (input ?? '').trim();
  if (!text) return null;
  if (text.includes('@') && !text.startsWith('@')) {
    return EMAIL_RE.test(text) ? { value: text.toLowerCase(), kind: 'email' } : null;
  }
  if (text.startsWith('@'))
    return TELEGRAM_RE.test(text) ? { value: text, kind: 'telegram' } : null;
  let phone = text.replace(/[\s\-()]/g, '');
  if (/^\d{12}$/.test(phone) && phone.startsWith('998')) phone = `+${phone}`;
  return PHONE_RE.test(phone) ? { value: phone, kind: 'phone' } : null;
}

export function messageTime(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return '';
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
