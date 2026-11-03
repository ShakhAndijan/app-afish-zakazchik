import { useSyncExternalStore } from 'react';

// Real vaqt (Socket.IO) holati va hodisalar shinasi. Ulanish `src/realtime/RealtimeSync.js` da,
// ekranlar esa shu yerdan hodisalarga obuna bo'ladi va "ulangan" bo'lsa so'rashni siyraklashtiradi.

let connected = false;
const statusListeners = new Set();
const eventListeners = new Set();

export const isRealtimeConnected = () => connected;

export function setRealtimeConnected(value) {
  if (connected === value) return;
  connected = value;
  statusListeners.forEach((fn) => fn());
}

/** Serverdan hodisa kelganda `fn(eventName, payload)` chaqiriladi. Qaytgan funksiya obunani bekor qiladi. */
export function subscribeRealtime(fn) {
  eventListeners.add(fn);
  return () => eventListeners.delete(fn);
}

export function emitRealtime(event, payload) {
  eventListeners.forEach((fn) => fn(event, payload));
}

const subscribeStatus = (fn) => {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
};

export const useRealtimeConnected = () =>
  useSyncExternalStore(subscribeStatus, isRealtimeConnected);

/**
 * So'rab turish oralig'i: real vaqt ulangan bo'lsa siyrak (zaxira), aks holda tez.
 * React Query `refetchInterval` va `usePolling` ga funksiya sifatida beriladi.
 */
export const pollEvery = (fastMs, slowMs) => () => (connected ? slowMs : fastMs);
