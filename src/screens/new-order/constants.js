export const MAX_PHOTOS = 10;

// Yandex geokoderi hozircha API kalit ruxsati yo'qligi sabab ishlamayapti
// ("scriptError") — shuning uchun viloyat darajasida ishonchli zaxira sifatida
// bu jadval ishlatiladi (`code` maydoni bo'yicha). Tuman darajasi hali ham
// geokoder orqali urinib ko'riladi — kalit tuzatilgach avtomatik ishlay boshlaydi.
export const REGION_COORDS = {
  'toshkent-shahri': [41.2995, 69.2401],
  'andijon': [40.7821, 72.3442],
  'buxoro': [39.7747, 64.4286],
  'fargona': [40.3894, 71.7864],
  'jizzax': [40.1158, 67.8422],
  'namangan': [40.9983, 71.6726],
  'navoiy': [40.0844, 65.3792],
  'qashqadaryo': [38.8606, 65.7891],
  'samarqand': [39.6542, 66.9597],
  'sirdaryo': [40.4897, 68.7842],
  'surxondaryo': [37.2242, 67.2783],
  'toshkent-viloyati': [40.9983, 69.3411],
  'xorazm': [41.5506, 60.6317],
  'qoraqalpogiston': [42.4531, 59.6103],
};

// "Qachon" bo'limidagi tanlov backend'ning `timing_kind` enumiga mos keladi.
export const TIMING_KIND_MAP = {
  urgent: 'urgent',
  today: 'today',
  date: 'scheduled',
  flexible: 'flexible',
};
