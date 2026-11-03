import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';
import { getWorkersPresence } from '../api/workers';

const POLL_MS = 2 * 60 * 1000;

/**
 * Ekrandagi ustalarning "Onlayn / Band / Dam olishda" holatini 2 daqiqada bir yangilaydi (ekran ochiq
 * bo'lganda) va ro'yxatga qo'shib qaytaradi. Holat kelmaguncha ro'yxatdagi qiymat qoladi.
 */
export function useWithPresence(workers) {
  const focused = useIsFocused();
  const ids = useMemo(
    () =>
      [...new Set((workers ?? []).map((w) => w.id).filter((id) => id != null))]
        .slice(0, 100)
        .sort((a, b) => a - b),
    [workers]
  );
  const { data } = useQuery({
    queryKey: ['workers', 'presence', ids.join(',')],
    queryFn: () => getWorkersPresence(ids),
    enabled: focused && ids.length > 0,
    refetchInterval: focused ? POLL_MS : false,
    staleTime: POLL_MS / 2,
  });

  return useMemo(() => {
    if (!data || !workers) return workers;
    return workers.map((w) => {
      const p = data[w.id];
      return p
        ? { ...w, availability: p.availability, busyUntil: p.busyUntil, is_online: p.isOnline }
        : w;
    });
  }, [workers, data]);
}
