import { useEffect, useRef } from 'react';
import { useIsFocused } from 'expo-router';

// `fn` ni har `intervalMs` da chaqiradi, lekin faqat ekran ko'rinib turganda va `enabled` bo'lsa.
// Ekranga qaytilganda darhol bir marta chaqiradi (kechikib qolgan ma'lumot yangilanadi).
export default function usePolling(fn, intervalMs, enabled = true) {
  const focused = useIsFocused();
  const latest = useRef(fn);
  latest.current = fn;

  useEffect(() => {
    if (!focused || !enabled) return undefined;
    latest.current();
    const timer = setInterval(() => latest.current(), intervalMs);
    return () => clearInterval(timer);
  }, [focused, enabled, intervalMs]);
}
