import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/user';
import { queryClient } from '../queries/client';
import { devLog } from '../utils/log';

const CACHE_KEY = 'cached_user';
export const ME_QUERY_KEY = ['me'];

const UserContext = createContext({
  user: null,
  loading: true,
  refreshing: false,
  unauthorized: false,
  refreshUser: () => {},
  clearUser: () => {},
});

async function fetchMe() {
  const fresh = await getMe();
  devLog('[UserContext] fresh user:', fresh);
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
  return fresh;
}

// `enabled` — faqat kirgan foydalanuvchida ma'lumot yuklanadi; chiqqanda holat tozalanadi.
// Foydalanuvchi ma'lumoti React Query keshida turadi (['me']); diskdagi nusxa ilova ochilganda
// bo'sh ekran bo'lmasligi uchun darhol ko'rsatiladi va fonda yangilanadi.
export function UserProvider({ children, enabled = true }) {
  const [cacheRead, setCacheRead] = useState(false);

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    enabled,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        // updatedAt: 0 — diskdagi nusxa "eskirgan" hisoblanadi, shuning uchun darhol yangilanadi.
        if (cached && !cancelled && !queryClient.getQueryData(ME_QUERY_KEY)) {
          queryClient.setQueryData(ME_QUERY_KEY, JSON.parse(cached), { updatedAt: 0 });
        }
      } catch {}
      if (!cancelled) setCacheRead(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const { refetch } = query;
  const refreshUser = useCallback(() => refetch(), [refetch]);

  const clearUser = useCallback(() => {
    queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
    AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user: query.data ?? null,
      loading: !cacheRead,
      refreshing: query.isFetching,
      unauthorized: query.error?.status === 401,
      refreshUser,
      clearUser,
    }),
    [query.data, query.isFetching, query.error, cacheRead, refreshUser, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);

// AuthContext.signOut kabi UserProvider daraxtidan tashqarida
// turgan joylardan ham keshni tozalash uchun.
export const clearCachedUser = () => AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
