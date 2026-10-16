// Mavsumiy yo'nalishlar: joriy oyga qarab qaysi kategoriyalar ko'rsatilishi.
// Kategoriya nomi (backenddan) shu ifodalardan biriga mos kelsa, mavsumga kiradi.

// Nomlar backenddan turli tilda kelishi mumkin (o'zbek, rus) — shuning uchun nom va inglizcha slug
// birga tekshiriladi.
const HEATING = /isitish|отоплен|heating/i;
const PLUMBING = /santexnik|сантехник|plumb/i;
const ELECTRIC = /elektrik|электрик|electric/i;
const AUTO = /avtomobil|автомобил|авто|\bcar\b|auto/i;
const CLEANING = /tozalik|tozalash|уборк|клининг|clean/i;
const CARGO = /yuk|груз|перевоз|cargo|moving|deliver/i;
const REPAIR = /ta.?mirlash|ремонт|repair|renovation/i;
const GARDEN = /bog.?bon|сад|огород|garden/i;
const BUILD = /qurilish|строитель|construction/i;
const APPLIANCE = /texnika|техник|appliance/i;

export const SEASONS = {
  winter: { months: [11, 0, 1], match: [HEATING, PLUMBING, ELECTRIC, AUTO, CLEANING, CARGO] },
  spring: { months: [2, 3, 4], match: [REPAIR, GARDEN, CLEANING, BUILD, CARGO, AUTO] },
  summer: { months: [5, 6, 7], match: [APPLIANCE, BUILD, GARDEN, REPAIR, AUTO, ELECTRIC] },
  autumn: { months: [8, 9, 10], match: [HEATING, ELECTRIC, PLUMBING, REPAIR, AUTO, CLEANING] },
};

export function seasonOf(date = new Date()) {
  const month = date.getMonth();
  return Object.keys(SEASONS).find((key) => SEASONS[key].months.includes(month)) ?? 'autumn';
}

// Mavsumga mos kategoriyalar (mavsum ifodalari tartibida; takrorlanmaydi).
export function seasonalCategories(categories, season) {
  const picked = [];
  SEASONS[season].match.forEach((re) => {
    const found = categories.find(
      (c) => re.test(`${c.label ?? ''} ${c.slug ?? ''}`) && !picked.includes(c)
    );
    if (found) picked.push(found);
  });
  return picked;
}
