// Login maydoni telefon raqami yoki email sifatida ishlashi mumkin.
// Faqat raqamlardan iborat qiymat — telefon, harf yoki '@' bor bo'lsa — email.
export function detectIdentifierMode(raw = '') {
  const v = (raw || '').trim();
  if (!v) return 'empty';
  return /^[0-9\s]+$/.test(v) ? 'phone' : 'email';
}

// `mode` ('phone' | 'email') aniq berilsa shu bo'yicha, bo'lmasa qiymatdan aniqlanadi.
export function buildIdentifier(raw = '', mode) {
  const m = mode ?? detectIdentifierMode(raw);
  return m === 'phone' ? '+998' + raw.replace(/\D/g, '') : raw.trim();
}
