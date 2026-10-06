// Filtr variantlari va o'lchamlar.

export const EXP_OPTIONS = [1, 3, 5];

export const PRICE_OPTIONS = [
  { key: 'arzon', labelKey: 'priceCheapFirst' },
  { key: 'qimmat', labelKey: 'priceExpensiveFirst' },
];

export const RATING_OPTIONS = [
  { key: 4.5, label: '4.5+' },
  { key: 4.8, label: '4.8+' },
  { key: 5, label: '5.0' },
];

// Yo'nalish rangi (backend rang bermasa) va hero/ro'yxat urg'usi.
export const CATEGORY_ACCENT = '#e87a45';

// "Ommabop yo'nalishlar" gorizontal ro'yxati o'lchamlari.
export const POPULAR_TILE_W = 100;
export const POPULAR_GAP = 12;
export const POPULAR_SLOT = POPULAR_TILE_W + POPULAR_GAP;
