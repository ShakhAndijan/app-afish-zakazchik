import { useMemo } from 'react';
import { useCategoriesQuery } from '../../../queries/categories';
import { CATEGORY_ACCENT } from '../constants';

// Yo'nalishlar ro'yxati (GET /categories). `categories` — kartochkaga tayyor ko'rinishda,
// `popular` — ustasi bor yo'nalishlar, ustalar soni bo'yicha kamayish tartibida.
export default function useCategories() {
  const { categories: raw, loading } = useCategoriesQuery();

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
