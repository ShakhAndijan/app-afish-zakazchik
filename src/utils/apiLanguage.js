// Ilova tili backendga `Accept-Language` sifatida yuboriladi: yo'nalish nomlari, xato matnlari
// va boshqa tarjima qilinadigan javoblar shu tilda qaytadi. LanguageProvider yangilab turadi.
let current = 'uz';

export const setApiLanguage = (lang) => {
  if (lang) current = lang;
};
export const getApiLanguage = () => current;
