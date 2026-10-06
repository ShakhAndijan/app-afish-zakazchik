// ─── NAMUNA ma'lumot (mock) ─────────────────────────────────────
// Backend hali ish uchun joylashuv, narx, davomiylik, usta izohi va mijoz sharhini
// to'liq qaytarmaydi. Shuning uchun har bir ish uchun barqaror (id'ga bog'liq) namunaviy
// qiymatlar hosil qilamiz. Ekranda ular faqat backenddan kelmagan maydonlar o'rniga ishlatiladi
// va "Namuna ma'lumot" belgisi bilan ko'rsatiladi. Matnlar hozircha faqat o'zbekcha.

const CATEGORY_TAGS = ['Santexnika', 'Elektrik', 'Duradgorlik', "Bo'yash", 'Tozalash', 'Konditsioner'];
const LOCATIONS = ['Chilonzor', 'Yunusobod', "Mirzo Ulug'bek", 'Sergeli', 'Yakkasaroy', 'Shayxontohur'];
const DURATIONS = ['2 soat', '3 soat', '4 soat', '1 kun', '2 kun'];
const POSTED_AGO = [
  '2 kun oldin',
  '5 kun oldin',
  '1 hafta oldin',
  '2 hafta oldin',
  '3 hafta oldin',
  '1 oy oldin',
];

const MASTER_NOTES = [
  "Ish belgilangan muddatda, sifatli materiallar bilan bajarildi. Mijoz talablariga to'liq javob berdik.",
  'Barcha ishlar xavfsizlik qoidalariga rioya qilingan holda, puxta yakunlandi.',
  "Mijoz bilan kelishilgan rejaga asosan, qo'shimcha kechikishlarsiz ishni topshirdik.",
  "Sifatli jihozlar va zamonaviy uslublardan foydalanib, natijani mijozga ko'rsatdik.",
];

const CUSTOMER_REVIEWERS = [
  { name: 'Dilnoza R.', initial: 'D', color: '#ec4899' },
  { name: 'Sardor M.', initial: 'S', color: '#3f7fd4' },
  { name: 'Gulnora T.', initial: 'G', color: '#9b6cd1' },
  { name: 'Aziz K.', initial: 'A', color: '#2fa37a' },
  { name: 'Malika B.', initial: 'M', color: '#f5c451' },
];

const CUSTOMER_NOTES = [
  'Juda tez va sifatli ishladi, albatta yana murojaat qilamiz!',
  'Belgilangan vaqtda keldi, ishni toza va puxta bajardi. Rahmat!',
  "Narxi mos, sifati a'lo darajada. Tavsiya qilaman.",
  "Muloqoti yoqimli, ishiga mas'uliyat bilan yondashadi.",
];

function hashOf(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function mockWorkDetails(work) {
  const seed = hashOf(work?.id != null ? String(work.id) : work?.title || '');
  const total = 120000 + (seed % 12) * 25000;
  const materialRatio = 0.3 + (seed % 20) / 100;
  const material = Math.round((total * materialRatio) / 1000) * 1000;
  const reviewer = CUSTOMER_REVIEWERS[seed % CUSTOMER_REVIEWERS.length];

  return {
    category: CATEGORY_TAGS[seed % CATEGORY_TAGS.length],
    location: LOCATIONS[(seed >> 2) % LOCATIONS.length],
    postedAgo: POSTED_AGO[(seed >> 4) % POSTED_AGO.length],
    duration: DURATIONS[(seed >> 3) % DURATIONS.length],
    price: total,
    priceMaterial: material,
    priceLabor: total - material,
    masterNote: MASTER_NOTES[(seed >> 1) % MASTER_NOTES.length],
    customerReview: {
      ...reviewer,
      rating: work?.rating || 5,
      text: CUSTOMER_NOTES[(seed >> 5) % CUSTOMER_NOTES.length],
    },
  };
}
