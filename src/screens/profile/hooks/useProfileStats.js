import { useState, useEffect } from 'react';
import { getCustomerMe } from '../../../api/user';
import { getFavoritesCount } from '../../../api/workers';

const toRating = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Profil ekranidagi statistika: buyurtmalar soni va reyting (GET /customers/me),
// sevimli ustalar soni (GET /customers/me/favorites). `active` true bo'lganda
// (profil ekrani ko'ringanda) qayta yuklanadi. Olinmagan qiymat — null.
export default function useProfileStats(active) {
  const [stats, setStats] = useState({ orders: null, favorites: null, rating: null });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    Promise.allSettled([getCustomerMe(), getFavoritesCount()]).then(([me, fav]) => {
      if (cancelled) return;
      // Xato bo'lsa, avval olingan qiymat saqlanadi.
      setStats((prev) => ({
        orders: me.status === 'fulfilled' ? me.value?.total_orders ?? null : prev.orders,
        rating: me.status === 'fulfilled' ? toRating(me.value?.overall_rating) : prev.rating,
        favorites: fav.status === 'fulfilled' ? fav.value : prev.favorites,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  return stats;
}
