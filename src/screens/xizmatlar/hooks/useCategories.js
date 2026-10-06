import { useState, useEffect, useMemo } from 'react';
import { getCategories } from '../../../api/categories';
import { CATEGORY_ACCENT } from '../constants';

// Yo'nalishlar ro'yxati (GET /categories). `categories` — kartochkaga tayyor ko'rinishda,
// `popular` — ustasi bor yo'nalishlar, ustalar soni bo'yicha kamayish tartibida.
export default function useCategories() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (!cancelled) setRaw(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () =>
      [...raw]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((c) => ({
          id: c.id,
          label: c.name,
          glyph: c.icon,
          color: c.color || CATEGORY_ACCENT,
          count: c.worker_count ?? 0,
        })),
    [raw]
  );

  const popular = useMemo(
    () => categories.filter((c) => c.count > 0).sort((a, b) => b.count - a.count),
    [categories]
  );

  return { categories, popular, loading };
}
