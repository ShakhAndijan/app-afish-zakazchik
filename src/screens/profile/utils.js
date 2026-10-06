// "901234567" yoki "+998901234567" → "+998 90 123 45 67"
export const formatPhoneDisplay = (raw = '') => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('998') && d.length > 9) d = d.slice(3); // to'liq raqamdan (+998...) mamlakat kodini olib tashlaymiz
  d = d.slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return `+998 ${s}`.trim();
};
