// O'zbek lotin yozuvini kirillga o'giradi (rasmiy imlo qoidalari bo'yicha). Kirill tili (`cr`) uchun ilova
// matnlari shu orqali `uz` lug'atidan hosil qilinadi; backenddan lotinda kelgan matn ham shunday o'giriladi.
//
// Qoidalar: o‘ → ў, g‘ → ғ, sh → ш, ch → ч, yo/yu/ya/ye → ё/ю/я/е, so'z boshidagi e → э, tutuq belgisi
// (ma'lumot) → ъ, ts → ц. Lotinda qoladiganlar: havola, email, {o'rin_egalari} va brend nomlari.

const APOSTROPHES = "'‘’ʻʼ`";
const isApostrophe = (ch) => !!ch && APOSTROPHES.includes(ch);

const SINGLE = {
  a: 'а',
  b: 'б',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'ҳ',
  i: 'и',
  j: 'ж',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  q: 'қ',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'в',
  x: 'х',
  y: 'й',
  z: 'з',
  c: 'ц', // faqat "ch"/"ts" dan tashqarida uchrasa (xorijiy so'z)
  w: 'в',
};

// Lotinda qoladigan qismlar.
const KEEP =
  /\{[^}]*\}|https?:\/\/\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\b(?:[Hh]arna(?:\.uz)?|Telegram|Google|Apple|Instagram|WhatsApp|Facebook|YouTube|Click|Payme|Uzum|Humo|UzCard|Visa|Mastercard|Yandex|Expo|Android|iOS|PDF|SMS|OTP|QR|GPS|Wi-?Fi|API)\b/g;

const isLetter = (ch) => !!ch && /[A-Za-zЀ-ӿ]/.test(ch);
const keepCase = (src, out) =>
  src === src.toUpperCase() && src !== src.toLowerCase() ? out.toUpperCase() : out;

function convert(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const lower = ch.toLowerCase();
    const next = text[i + 1];
    const nextLower = next ? next.toLowerCase() : '';
    const prev = text[i - 1];

    if (isApostrophe(ch)) {
      // Harf ichidagi tutuq belgisi → ъ (o‘/g‘ ularning o'zida qayta ishlanadi).
      const caps = isLetter(prev) && prev === prev.toUpperCase() && next === next.toUpperCase();
      out += isLetter(prev) && isLetter(next) ? (caps ? 'Ъ' : 'ъ') : ch;
      continue;
    }
    if (!/[A-Za-z]/.test(ch)) {
      out += ch;
      continue;
    }

    // o‘ / g‘
    if ((lower === 'o' || lower === 'g') && isApostrophe(next)) {
      out += keepCase(ch, lower === 'o' ? 'ў' : 'ғ');
      i += 1;
      continue;
    }
    // email → имейл
    if (lower === 'e' && !isLetter(prev) && text.slice(i, i + 5).toLowerCase() === 'email') {
      const word = text.slice(i, i + 5);
      out += keepCase(word, ch === lower ? 'имейл' : 'Имейл');
      i += 4;
      continue;
    }
    // sh, ch
    if (lower === 's' && nextLower === 'h') {
      out += keepCase(ch, 'ш');
      i += 1;
      continue;
    }
    if (lower === 'c' && nextLower === 'h') {
      out += keepCase(ch, 'ч');
      i += 1;
      continue;
    }
    // ts → ц faqat xorijiy so'zlarda (-tsiya, tsio, tsent); "xizmatsiz" kabi qo'shimcha oldidagi ts o'zgarmaydi
    if (lower === 't' && nextLower === 's' && /^(i[yoaeu]|e)/i.test(text.slice(i + 2, i + 4))) {
      out += keepCase(ch, 'ц');
      i += 1;
      continue;
    }
    // yo / yu / ya / ye ("yo'" — й + ў, shuning uchun o'ng tomonda tutuq bo'lmasligi shart)
    if (lower === 'y') {
      if (nextLower === 'o' && !isApostrophe(text[i + 2])) {
        out += keepCase(ch, 'ё');
        i += 1;
        continue;
      }
      if (nextLower === 'u') {
        out += keepCase(ch, 'ю');
        i += 1;
        continue;
      }
      if (nextLower === 'a') {
        out += keepCase(ch, 'я');
        i += 1;
        continue;
      }
      if (nextLower === 'e') {
        out += keepCase(ch, 'е');
        i += 1;
        continue;
      }
    }
    // so'z boshidagi e → э
    if (lower === 'e' && !isLetter(prev)) {
      out += keepCase(ch, 'э');
      continue;
    }

    out += keepCase(ch, SINGLE[lower] ?? ch);
  }
  return out;
}

/** Lotincha matnni kirillga o'giradi; kirill harflar va lotinda qoladigan qismlar o'zgarmaydi. */
export function toCyrillic(text) {
  if (typeof text !== 'string' || !/[A-Za-z]/.test(text)) return text;
  let out = '';
  let last = 0;
  KEEP.lastIndex = 0;
  let m;
  while ((m = KEEP.exec(text))) {
    out += convert(text.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + convert(text.slice(last));
}

/** Lug'at (obyekt/massiv/satr) ichidagi barcha satr qiymatlarni o'giradi; kalitlar o'zgarmaydi. */
export function translitDeep(value) {
  if (typeof value === 'string') return toCyrillic(value);
  if (Array.isArray(value)) return value.map(translitDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = translitDeep(value[k]);
    return out;
  }
  return value;
}
