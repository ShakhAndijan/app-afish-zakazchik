// Buyurtma formasining qoralamasi: forma o'zgargan sari telefon xotirasiga yoziladi va ekran qayta
// ochilganda (tabdan chiqib kirilganda, telefon bloklanib ilova tizim tomonidan o'chirilganda) tiklanadi.
// Rasmlar saqlanmaydi.

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PREFIX = 'order_draft:';
const DRAFT_VERSION = 1;
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // eskirgan qoralama tiklanmaydi
const SAVE_DELAY_MS = 500;

// `enabled` — qoralama ishlatilsinmi; `userId` — qoralama egasi (boshqa akkaunt qoralamasi
// aralashmasligi uchun); `snapshot` — saqlanadigan (JSON'ga o'tadigan) forma qiymatlari;
// `onRestore(data)` — saqlangan qiymatlarni formaga qaytaradi.
export default function useOrderDraft({ enabled, userId, snapshot, onRestore }) {
  const key = enabled && userId != null ? `${DRAFT_PREFIX}${userId}` : null;
  const json = JSON.stringify(snapshot);

  const [restored, setRestored] = useState(false);
  // Boshlang'ich (bo'sh) forma: undan farq qilmasa, yozilgan qoralama o'chiriladi.
  const [emptyJson] = useState(json);
  const hydratedRef = useRef(false);
  const stoppedRef = useRef(false);
  const pendingRef = useRef(null);
  const keyRef = useRef(key);
  const restoreRef = useRef(onRestore);
  const emptyRef = useRef(emptyJson);

  useEffect(() => {
    keyRef.current = key;
    restoreRef.current = onRestore;
  });

  // Saqlangan qoralamani o'qish. O'qib bo'lgunga qadar yozilmaydi, aks holda bo'sh forma
  // mavjud qoralamani ezib yuborardi.
  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const draft = JSON.parse(raw);
            if (draft?.v === DRAFT_VERSION && Date.now() - draft.savedAt < DRAFT_TTL_MS) {
              restoreRef.current(draft.data);
              setRestored(true);
            } else {
              AsyncStorage.removeItem(key).catch(() => {});
            }
          } catch {
            AsyncStorage.removeItem(key).catch(() => {});
          }
        }
        hydratedRef.current = true;
      })
      .catch(() => {
        hydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const flush = useCallback(() => {
    const k = keyRef.current;
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!k || !pending || stoppedRef.current) return;
    if (pending.json === emptyRef.current) {
      AsyncStorage.removeItem(k).catch(() => {});
      return;
    }
    AsyncStorage.setItem(
      k,
      JSON.stringify({ v: DRAFT_VERSION, savedAt: Date.now(), data: pending.data })
    ).catch(() => {});
  }, []);

  useEffect(() => {
    if (!key || !hydratedRef.current || stoppedRef.current) return undefined;
    pendingRef.current = { json, data: snapshot };
    const timer = setTimeout(flush, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // `snapshot` har renderda yangi obyekt: o'zgarish `json` orqali kuzatiladi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, json, flush]);

  // Telefon bloklanganda/ilova fonga o'tganda va ekran yopilganda kutayotgan o'zgarish darhol yoziladi.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flush();
    });
    return () => {
      sub.remove();
      flush();
    };
  }, [flush]);

  // Buyurtma yuborilganda yoki foydalanuvchi "yangidan boshlash" desa: qoralama o'chadi va shu
  // ekran nusxasi boshqa yozmaydi.
  const clearDraft = useCallback(() => {
    stoppedRef.current = true;
    pendingRef.current = null;
    if (keyRef.current) AsyncStorage.removeItem(keyRef.current).catch(() => {});
    setRestored(false);
  }, []);

  return { restored, clearDraft };
}
