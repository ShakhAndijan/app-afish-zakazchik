import { useState, useEffect } from 'react';
import { unlockToken, hasStoredSession, clearTokens } from '../utils/token';

// Ilova ochilganda saqlangan sessiyani tekshiradi va biometrik bilan ochadi.
//  - `authChecked`: dastlabki tekshiruv tugadimi (shundan keyin ekran tanlanadi)
//  - `locked`: sessiya bor, lekin biometrik o'tmadi (qulf ekrani ko'rsatiladi)
//  - `onUnlocked`: token muvaffaqiyatli ochilganda chaqiriladi (odatda dashboardga o'tkazadi)
export default function useAuthGate({ onUnlocked }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const tryUnlock = async () => {
    const token = await unlockToken();
    if (!token) return false;
    onUnlocked();
    setLocked(false);
    return true;
  };

  const retryUnlock = async () => {
    setUnlocking(true);
    const ok = await tryUnlock();
    setUnlocking(false);
    if (!ok) setLocked(true);
  };

  // "Boshqa hisobdan kirish": saqlangan tokenlar o'chiriladi.
  const abandonSession = async () => {
    await clearTokens();
    setLocked(false);
  };

  useEffect(() => {
    (async () => {
      if (await hasStoredSession()) {
        const ok = await tryUnlock();
        if (!ok) setLocked(true);
      }
      setAuthChecked(true);
    })();
  }, []);

  return { authChecked, locked, unlocking, retryUnlock, abandonSession };
}
