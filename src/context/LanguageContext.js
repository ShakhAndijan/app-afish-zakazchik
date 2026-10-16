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
import { translations } from '../i18n/translations';

const LANG_KEY = 'app_language';
export const DEFAULT_LANG = 'uz';

function resolve(dict, key) {
  return key
    .split('.')
    .reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.keys(vars).reduce(
    (s, k) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]),
    str
  );
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

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved && translations[saved]) setLanguageState(saved);
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
        resolve(translations[language], key) ??
        resolve(translations[DEFAULT_LANG], key) ??
        key;
      return typeof value === 'string' ? interpolate(value, vars) : value;
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
