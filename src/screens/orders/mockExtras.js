// ─── MOCK (vaqtincha) ───────────────────────────────────────────────
// Backend buyurtma javobida quyidagilar hali yo'q, lekin dizaynda ular kerak:
//   • usta reytingi, usta izohi, mijoz sharhi (va bahosi),
//   • narxning "materiallar / ish haqi" bo'linishi.
// Shuning uchun ular buyurtma id'siga bog'liq barqaror namunaviy qiymatlar bilan
// to'ldiriladi va UI da "Namuna ma'lumot" belgisi bilan ko'rsatiladi (MockBadge).
// Backend tayyor bo'lganda shu fayl va MockBadge ishlatilgan joylar olib tashlanadi.

const MASTER_NOTES = [
  "Ish belgilangan muddatda, sifatli materiallar bilan bajarildi. Mijoz talablariga to'liq javob berdik.",
  'Barcha ishlar xavfsizlik qoidalariga rioya qilingan holda, puxta yakunlandi.',
  "Mijoz bilan kelishilgan rejaga asosan, qo'shimcha kechikishlarsiz ishni topshirdik.",
  "Sifatli jihozlar va zamonaviy uslublardan foydalanib, natijani mijozga ko'rsatdik.",
];

const CUSTOMER_NOTES = [
  'Juda tez va sifatli ishladi, albatta yana murojaat qilamiz!',
  'Belgilangan vaqtda keldi, ishni toza va puxta bajardi. Rahmat!',
  "Narxi mos, sifati a'lo darajada. Tavsiya qilaman.",
  "Muloqoti yoqimli, ishiga mas'uliyat bilan yondashadi.",
];

function hashOf(id) {
  const str = String(id ?? '');
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * @returns {{
 *   masterRating: number|null,
 *   masterNote: string|null,
 *   customerRating: number,
 *   customerNote: string|null,
 *   material: number|null,
 *   labor: number|null,
 * }}
 */
export function getMockOrderExtras(order) {
  const seed = hashOf(order.id);
  const isDone = order.status === 'done';
  const hasMaster = !!order.workerId;

  // Narx bo'linishi: faqat narxi bor, bekor qilinmagan buyurtmada.
  let material = null;
  let labor = null;
  if (order.price != null && order.status !== 'cancelled') {
    const ratio = 0.3 + (seed % 20) / 100;
    material = Math.round((order.price * ratio) / 1000) * 1000;
    labor = order.price - material;
  }

  return {
    masterRating: hasMaster ? 4 + ((seed >> 2) % 11) / 10 : null, // 4.0 – 5.0
    masterNote: isDone ? MASTER_NOTES[(seed >> 1) % MASTER_NOTES.length] : null,
    customerRating: 4 + ((seed >> 3) % 2), // 4 yoki 5
    customerNote: isDone ? CUSTOMER_NOTES[(seed >> 5) % CUSTOMER_NOTES.length] : null,
    material,
    labor,
  };
}
