import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getPreferences, updatePreferences } from '../api/preferences';

// Til va mavzuni hisobga bog'laydi (GET/PATCH /auth/preferences): kirganda hisobda saqlangani ilovaga
// qo'llanadi (boshqa qurilmada tanlangan til/mavzu shu yerda ham chiqadi), hisobda yo'q bo'lsa ilovadagisi
// saqlanadi; keyin o'zgarishlar hisobga yuborib boriladi. Xato bo'lsa jim: ilova mahalliy sozlama bilan ishlayveradi.
export default function usePreferencesSync() {
  const { signedIn, locked } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { mode, setThemeMode } = useTheme();
  const active = signedIn && !locked;

  // Hisobdagi oxirgi ma'lum qiymatlar; `null` — hali yuklanmagan (o'zgarishlar yuborilmaydi).
  const known = useRef(null);
  const current = useRef({ language, mode });
  useEffect(() => {
    current.current = { language, mode };
  }, [language, mode]);

  useEffect(() => {
    if (!active) {
      known.current = null;
      return undefined;
    }
    let cancelled = false;
    getPreferences()
      .then((server) => {
        if (cancelled) return;
        const local = current.current;
        const next = {
          language: server.language ?? local.language,
          theme: server.theme ?? local.mode,
        };
        known.current = next;
        if (next.language !== local.language) setLanguage(next.language);
        if (next.theme !== local.mode) setThemeMode(next.theme);
        // Hisobda tanlanmagan maydonlar ilovadagi qiymat bilan to'ldiriladi.
        const fill = {};
        if (!server.language) fill.language = next.language;
        if (!server.theme) fill.theme = next.theme;
        if (Object.keys(fill).length) updatePreferences(fill).catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active, setLanguage, setThemeMode]);

  // Kirgandan keyingi o'zgarishlar.
  useEffect(() => {
    const k = known.current;
    if (!k) return;
    const patch = {};
    if (k.language !== language) patch.language = language;
    if (k.theme !== mode) patch.theme = mode;
    if (!Object.keys(patch).length) return;
    known.current = { ...k, ...patch };
    updatePreferences(patch).catch(() => {
      known.current = k; // keyingi o'zgarishda qayta uriniladi
    });
  }, [language, mode]);
}
