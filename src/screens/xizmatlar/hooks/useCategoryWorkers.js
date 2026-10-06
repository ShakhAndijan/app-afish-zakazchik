import { useState, useEffect } from 'react';
import { getWorkersPage } from '../../../api/workers';

const SEARCH_DEBOUNCE_MS = 400;

// Tanlangan yo'nalishdagi ustalar (birinchi sahifa). Hudud, reyting, tasdiqlangan, "arzon"
// tartibi va matnli qidiruv (`q`: ism, bio va xizmat nomlari) serverga so'rov parametri
// sifatida ketadi. `total` — serverdagi umumiy son.
export default function useCategoryWorkers(categoryId, filters, query = '') {
  const { region, district, minRating, certifiedOnly, sort } = filters;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    setLoading(true);
    // Har bir harfda so'rov yubormaslik uchun yozish to'xtagach kutamiz.
    const timer = setTimeout(
      () => {
        getWorkersPage({
          categoryId,
          page: 1,
          size: 20,
          regionId: region,
          districtId: district,
          minRating,
          verifiedOnly: certifiedOnly,
          sort: sort === 'arzon' ? 'price' : 'rating',
          q: query,
        })
          .then(({ items, total: count }) => {
            if (cancelled) return;
            setWorkers(items);
            setTotal(count);
          })
          .catch(() => {
            if (cancelled) return;
            setWorkers([]);
            setTotal(null);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      query.trim() ? SEARCH_DEBOUNCE_MS : 0
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [categoryId, region, district, minRating, certifiedOnly, sort, query]);

  const reset = () => {
    setWorkers([]);
    setTotal(null);
  };

  return { workers, loading, total, reset };
}
