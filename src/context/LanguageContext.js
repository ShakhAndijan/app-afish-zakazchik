import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { setApiLanguage } from '../utils/apiLanguage';
import { LANG_KEY, savedLanguage } from '../utils/startup';
import { translations } from '../i18n/translations';

export const DEFAULT_LANG = 'uz';

function resolve(dict, key) {
  return key
    .split('.')
    .reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.keys(vars).reduce((s, k) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]), str);
}

const LanguageContext = createContext({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANG);
  const queryClient = useQueryClient();
  const prevLanguage = useRef(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  // Saqlangan til birinchi renderdan oldin qo'yiladi (ekran avval "uz"da, keyin o'zgarib ko'rinmasin
  // va keraksiz qayta yuklash bo'lmasin); shu vaqtgacha native splash ko'rinib turadi.
  useEffect(() => {
    savedLanguage.then((saved) => {
      if (saved) {
        prevLanguage.current = saved;
        setLanguageState(saved);
      }
      setReady(true);
    });
  }, []);

  // Til o'zgarganda backend so'rovlari yangi tilda ketadi va serverdan kelgan tarjimali ma'lumotlar
  // (yo'nalish nomlari va h.k.) shu tilda qayta yuklanadi.
  useEffect(() => {
    setApiLanguage(language);
    if (prevLanguage.current !== language) {
      prevLanguage.current = language;
      queryClient.invalidateQueries();
    }
  }, [language, queryClient]);

  const setLanguage = useCallback((lang) => {
    if (!translations[lang]) return;
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const t = useCallback(
    (key, vars) => {
      const value =
        resolve(translations[language], key) ?? resolve(translations[DEFAULT_LANG], key) ?? key;
      return typeof value === 'string' ? interpolate(value, vars) : value;
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  if (!ready) return null;
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
