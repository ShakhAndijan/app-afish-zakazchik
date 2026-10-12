import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkersPage } from '../../../api/workers';

const SEARCH_DEBOUNCE_MS = 400;
const EMPTY = [];

// Tanlangan yo'nalishdagi ustalar (birinchi sahifa). Hudud, reyting, tasdiqlangan, "arzon"
// tartibi va matnli qidiruv (`q`: ism, bio va xizmat nomlari) serverga so'rov parametri
// sifatida ketadi. `total` — serverdagi umumiy son. Natija filtr kombinatsiyasi bo'yicha keshlanadi.
export default function useCategoryWorkers(categoryId, filters, query = '') {
  const { region, district, minRating, certifiedOnly, sort } = filters;

  // Har bir harfda so'rov yubormaslik uchun yozish to'xtagach kutamiz.
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), query.trim() ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [query]);

  const params = {
    categoryId,
    regionId: region,
    districtId: district,
    minRating,
    verifiedOnly: certifiedOnly,
    sort: sort === 'arzon' ? 'price' : 'rating',
    q: debouncedQuery,
  };

  const { data, isFetching } = useQuery({
    queryKey: ['workers', 'category', params],
    queryFn: () => getWorkersPage({ ...params, page: 1, size: 20 }),
    enabled: !!categoryId,
    // Filtr almashganda yangi natija kelguncha eski ro'yxat turadi (faqat shu yo'nalish ichida).
    placeholderData: (prev, prevQuery) =>
      prevQuery?.queryKey[2]?.categoryId === categoryId ? prev : undefined,
  });

  return {
    workers: data?.items ?? EMPTY,
    loading: !!categoryId && (isFetching || query !== debouncedQuery),
    total: data?.total ?? null,
  };
}
