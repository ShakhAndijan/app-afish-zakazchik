// Login maydoni telefon raqami yoki email sifatida ishlashi mumkin.
// Qaysi turi ekanligi kiritilgan qiymatning birinchi belgisiga qarab aniqlanadi:
// raqam bilan boshlansa — telefon, harf/belgi bilan boshlansa — email.
export function detectIdentifierMode(raw = '') {
  const first = (raw || '').trim()[0];
  if (!first) return 'empty';
  return /[0-9]/.test(first) ? 'phone' : 'email';
}

export function buildIdentifier(raw = '') {
  return detectIdentifierMode(raw) === 'phone'
    ? '+998' + raw.replace(/\D/g, '')
    : raw.trim();
}
