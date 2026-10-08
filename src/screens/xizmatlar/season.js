// Mavsumiy yo'nalishlar: joriy oyga qarab qaysi kategoriyalar ko'rsatilishi.
// Kategoriya nomi (backenddan) shu ifodalardan biriga mos kelsa, mavsumga kiradi.

export const SEASONS = {
  winter: {
    months: [11, 0, 1],
    match: [/isitish/i, /santexnik/i, /elektrik/i, /avtomobil/i, /tozalik|tozalash/i, /yuk/i],
  },
  spring: {
    months: [2, 3, 4],
    match: [/ta.?mirlash/i, /bog.?bon/i, /tozalik|tozalash/i, /qurilish/i, /yuk/i, /avtomobil/i],
  },
  summer: {
    months: [5, 6, 7],
    match: [/texnika/i, /qurilish/i, /bog.?bon/i, /ta.?mirlash/i, /avtomobil/i, /elektrik/i],
  },
  autumn: {
    months: [8, 9, 10],
    match: [/isitish/i, /elektrik/i, /santexnik/i, /ta.?mirlash/i, /avtomobil/i, /tozalik|tozalash/i],
  },
};

export function seasonOf(date = new Date()) {
  const month = date.getMonth();
  return Object.keys(SEASONS).find((key) => SEASONS[key].months.includes(month)) ?? 'autumn';
}

// Mavsumga mos kategoriyalar (mavsum ifodalari tartibida; takrorlanmaydi).
export function seasonalCategories(categories, season) {
  const picked = [];
  SEASONS[season].match.forEach((re) => {
    const found = categories.find((c) => re.test(c.label ?? '') && !picked.includes(c));
    if (found) picked.push(found);
  });
  return picked;
}
