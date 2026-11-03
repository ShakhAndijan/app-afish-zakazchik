import { useEffect, useRef } from 'react';
import { useIsFocused } from 'expo-router';
import { subscribeRealtime } from '../../../utils/realtime';

// `fn` ni har `intervalMs` da chaqiradi, lekin faqat ekran ko'rinib turganda va `enabled` bo'lsa.
// `intervalMs` son yoki (real vaqt ulanganda siyrakroq bo'ladigan) `() => ms` funksiya bo'lishi mumkin.
// Ekranga qaytilganda va serverdan real vaqt hodisasi kelganda darhol bir marta chaqiradi.
export default function usePolling(fn, intervalMs, enabled = true) {
  const focused = useIsFocused();
  const latest = useRef(fn);
  const interval = useRef(intervalMs);

  useEffect(() => {
    latest.current = fn;
    interval.current = intervalMs;
  });

  useEffect(() => {
    if (!focused || !enabled) return undefined;
    let timer;
    const schedule = () => {
      const ms = typeof interval.current === 'function' ? interval.current() : interval.current;
      timer = setTimeout(() => {
        latest.current();
        schedule();
      }, ms);
    };
    latest.current();
    schedule();
    const unsubscribe = subscribeRealtime(() => latest.current());
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [focused, enabled]);
}
