import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api/user';

const CACHE_KEY = 'cached_user';

const UserContext = createContext({
  user: null,
  loading: true,
  refreshing: false,
  unauthorized: false,
  refreshUser: () => {},
  clearUser: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const refreshUser = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await getMe();
      setUser(fresh);
      setUnauthorized(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } catch (err) {
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
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshing, unauthorized, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

// App.js'dagi handleLogout kabi UserProvider daraxtidan tashqarida
// turgan joylardan ham keshni tozalash uchun.
export const clearCachedUser = () => AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
