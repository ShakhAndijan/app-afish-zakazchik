import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';
import { setApiLanguage } from './apiLanguage';
import { devLog } from './log';
import { prefetchPublicHome } from '../queries/home';

const T0 = Date.now();

// Ishga tushish bosqichlari vaqti (faqat dev): qaysi qadam sekin ekanini ko'rsatadi.
export const markStartup = (label) => devLog(`[startup] +${Date.now() - T0}ms ${label}`);

export const LANG_KEY = 'app_language';

// Saqlangan til ilova ochilishi bilan bir marta o'qiladi: LanguageProvider (birinchi renderdan
// oldin to'g'ri tilni qo'yish uchun) va so'rovlarni oldindan yuklash (to'g'ri `Accept-Language`
// bilan ketishi uchun) shu va'dani kutadi.
export const savedLanguage = AsyncStorage.getItem(LANG_KEY)
  .then((lang) => (lang && translations[lang] ? lang : null))
  .catch(() => null);

markStartup('JS yuklandi');

savedLanguage.then((lang) => {
  if (lang) setApiLanguage(lang);
  markStartup(`til tayyor (${lang ?? 'standart'})`);
  prefetchPublicHome();
});
