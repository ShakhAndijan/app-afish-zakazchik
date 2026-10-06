import { useState, useEffect, useMemo } from 'react';
import { getSystemStats } from '../../../api/stats';

// Umumiy statistika (GET /system/stats). Olinmaguncha yoki xatoda qiymatlar '—'.
export default function useOverallStats() {
  const [systemStats, setSystemStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSystemStats()
      .then((data) => {
        if (!cancelled) setSystemStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const rating = Number(systemStats?.average_rating);
    return {
      totalMasters: systemStats?.worker_count ?? '—',
      avgRating:
        systemStats?.average_rating != null && Number.isFinite(rating) ? rating.toFixed(1) : '—',
      certified: systemStats?.verified_worker_count ?? '—',
    };
  }, [systemStats]);
}
