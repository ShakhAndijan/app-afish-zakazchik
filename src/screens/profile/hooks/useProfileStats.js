import { useQuery } from '@tanstack/react-query';
import { getCustomerMe } from '../../../api/user';
import { getFavoritesCount } from '../../../api/workers';

const toRating = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

const STALE_MS = 30 * 1000;

// Profil ekranidagi statistika: buyurtmalar soni va reyting (GET /customers/me),
// sevimli ustalar soni (GET /customers/me/favorites). `active` true bo'lganda
// (profil ekrani ko'ringanda) ma'lumot eskirgan bo'lsa qayta yuklanadi. Olinmagan qiymat — null;
// yangilash xato bersa, avval olingan qiymat saqlanadi.
export default function useProfileStats(active) {
  const me = useQuery({
    queryKey: ['customer', 'me'],
    queryFn: getCustomerMe,
    enabled: active,
    staleTime: STALE_MS,
  });
  const favorites = useQuery({
    queryKey: ['favorites', 'count'],
    queryFn: getFavoritesCount,
    enabled: active,
    staleTime: STALE_MS,
  });

  return {
    orders: me.data?.total_orders ?? null,
    rating: toRating(me.data?.overall_rating),
    favorites: favorites.data ?? null,
  };
}
