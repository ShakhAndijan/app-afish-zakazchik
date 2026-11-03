import { YANDEX_GEOCODER_API_KEY } from '../constants/config';

// Geokoder o'zbek tilida (lotin) javob beradi; uning "ʻ" belgilari ilovadagi oddiy apostrofga
// almashtiriladi ("ko'chasi").
export const normalizeApostrophes = (v) => (v ? v.replace(/[ʻʼ’‘`]/g, "'") : v);

// Ikki nuqta orasidagi taxminiy masofa (metr) — kichik farqlar uchun yetarli aniqlikda.
export const metersBetween = (a, b) => {
  const dLat = (a.latitude - b.latitude) * 111320;
  const dLng = (a.longitude - b.longitude) * 111320 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

export async function forwardGeocode(query) {
  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&format=json&geocode=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();
    const obj = json?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    const pos = obj?.Point?.pos;
    if (!pos) return null;
    const [lng, lat] = pos.split(' ').map(Number);
    return { lat, lng };
  } catch {
    return null;
  }
}

// Nomlarni solishtirish uchun: kichik harf, apostroflarsiz, "tumani/viloyati" kabi so'zlarsiz.
const normName = (v) =>
  (v || '')
    .toLowerCase()
    .replace(/[ʻʼ’‘`']/g, '')
    .replace(/\b(tumani|tuman|shahri|shahar|viloyati|viloyat)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Tanlangan tuman/viloyat markazi (qidiruvni shu atrofga cheklash uchun). Muvaffaqiyatsiz natija eslab qolinmaydi.
const areaCenterCache = new Map();
export async function areaCenter(query) {
  if (!areaCenterCache.has(query)) {
    const coords = await forwardGeocode(query);
    if (!coords) return null;
    areaCenterCache.set(query, coords);
  }
  return areaCenterCache.get(query);
}

const STREET_KINDS = ['house', 'street'];
const FALLBACK_KINDS = ['locality', 'district'];
const MAX_SUGGESTIONS = 4;

/**
 * Yozilgan ko'cha bo'yicha mos manzillar ro'yxati (eng ko'pi MAX_SUGGESTIONS ta). Yandex bir nechta
 * javob qaytaradi (tuman markazi, boshqa tumandagi bir xil nomli ko'cha, metro...), shuning uchun:
 *  - faqat uy/ko'cha olinadi (topilmasa — mahalla/aholi punkti, lekin tumanning o'zi emas);
 *  - tanlangan tuman/viloyat markazidan uzoqdagilar tashlanadi;
 *  - yozilgan so'zlar topilgan manzil matnida bo'lishi shart (aks holda Yandex tuman nomiga o'xshash
 *    boshqa ko'chani qaytarib yuboradi);
 *  - matnida tanlangan tuman/viloyat nomi bor javoblar oldinga chiqadi;
 *  - bir joydagi takroriy yozuvlar qisqartiriladi.
 * Hech narsa mos kelmasa — bo'sh ro'yxat.
 */
export async function searchAddresses({ query, street, district, region }, area) {
  try {
    // Yandex "Navoiy" kabi qisqa nomga ko'cha emas, boshqa joy (masalan TJM) qaytarishi mumkin;
    // "ko'chasi" qo'shilgan so'rov esa ko'chalarni topadi. Shuning uchun ikkalasi ham so'raladi.
    const queries = [query];
    if (!/(^| )(kocha|kucha)/.test(normName(street))) {
      // "Navoiy 12" -> "Navoiy ko'chasi 12": "ko'chasi" uy raqamidan oldin turishi kerak.
      const [, name, house = ''] = street.trim().match(/^(.*?)(\s+\d[\w/-]*)?$/);
      queries.push(query.replace(street, `${name} ko'chasi${house}`));
    }
    const responses = await Promise.all(
      queries.map(async (q) => {
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&format=json&results=10&lang=uz_UZ&geocode=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const json = await res.json();
        return json?.response?.GeoObjectCollection?.featureMember || [];
      })
    );
    const items = responses
      .flatMap((members, set) =>
        members.map((f, idx) => {
          const o = f.GeoObject;
          const meta = o?.metaDataProperty?.GeocoderMetaData;
          const [lng, lat] = (o?.Point?.pos || '').split(' ').map(Number);
          return {
            lat,
            lng,
            order: set * 100 + idx,
            kind: meta?.kind,
            text: normName(meta?.text),
            title: normalizeApostrophes(o?.name) || '',
            subtitle: normalizeApostrophes(o?.description) || '',
          };
        })
      )
      .filter((i) => i.title && Number.isFinite(i.lat) && Number.isFinite(i.lng));

    const areaPoint = area ? { latitude: area.lat, longitude: area.lng } : null;
    const distTo = (i) =>
      areaPoint ? metersBetween(areaPoint, { latitude: i.lat, longitude: i.lng }) : 0;
    const limit = district ? 40000 : region ? 150000 : Infinity;
    // Raqamlar va "ko'cha" so'zlari tekshirilmaydi; qolgan so'zlarning hammasi manzil matnida bo'lsin.
    const words = normName(street)
      .split(' ')
      .filter((w) => w.length >= 3 && !/^\d+$/.test(w) && !/^(kocha|kucha|kuch)/.test(w));
    const near = items.filter((i) => distTo(i) <= limit && words.every((w) => i.text.includes(w)));

    let pool = near.filter((i) => STREET_KINDS.includes(i.kind));
    if (!pool.length) {
      // Tumanning o'zi (markazi) "joy" emas — uni o'tkazib yuboramiz.
      pool = near.filter(
        (i) => FALLBACK_KINDS.includes(i.kind) && (!areaPoint || distTo(i) > 1500)
      );
    }

    const nd = normName(district);
    const nr = normName(region);
    const score = (i) => (nd && i.text.includes(nd) ? 0 : 2) + (nr && i.text.includes(nr) ? 0 : 1);
    pool.sort((a, b) => score(a) - score(b) || a.order - b.order);

    const kept = [];
    for (const i of pool) {
      const dup = kept.some(
        (k) =>
          k.title.toLowerCase() === i.title.toLowerCase() &&
          metersBetween(
            { latitude: k.lat, longitude: k.lng },
            { latitude: i.lat, longitude: i.lng }
          ) < 300
      );
      if (!dup) kept.push(i);
      if (kept.length >= MAX_SUGGESTIONS) break;
    }
    return kept.map((i) => ({
      id: `${i.lat},${i.lng},${i.title}`,
      title: i.title,
      subtitle: i.subtitle,
      lat: i.lat,
      lng: i.lng,
    }));
  } catch {
    return [];
  }
}
