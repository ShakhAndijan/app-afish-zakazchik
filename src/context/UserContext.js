import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api/user';
import { devLog } from '../utils/log';

const CACHE_KEY = 'cached_user';

const UserContext = createContext({
  user: null,
  loading: true,
  refreshing: false,
  unauthorized: false,
  refreshUser: () => {},
  clearUser: () => {},
});

// `enabled` — faqat kirgan foydalanuvchida ma'lumot yuklanadi; chiqqanda holat tozalanadi.
export function UserProvider({ children, enabled = true }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const refreshUser = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await getMe();
      devLog('[UserContext] refreshUser fresh user:', fresh);
      setUser(fresh);
      setUnauthorized(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } catch (err) {
      devLog('[UserContext] refreshUser error:', err?.status, err?.message ?? err);
      if (err.status === 401) setUnauthorized(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    setUnauthorized(false);
    AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      // 1) Keshdagi ma'lumotni darhol ko'rsatamiz — bo'sh ekran bo'lmasin.
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) setUser(JSON.parse(cached));
      } catch {}
      setLoading(false);

      // 2) Fonda backend'dan haqiqiy ma'lumotni olib, jimgina yangilaymiz.
      await refreshUser();
    })();
  }, [refreshUser, enabled]);

  return (
    <UserContext.Provider value={{ user, loading, refreshing, unauthorized, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

// AuthContext.signOut kabi UserProvider daraxtidan tashqarida
// turgan joylardan ham keshni tozalash uchun.
export const clearCachedUser = () => AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
