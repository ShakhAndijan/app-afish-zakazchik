import { useMemo } from 'react';
import { useCategoryTreeQuery } from '../../../queries/categories';
import { CATEGORY_ACCENT } from '../constants';

// Backend och pastel rang beradi (belgi foni sifatida ishlatiladi); noto'g'ri qiymat bo'lsa — standart urg'u.
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const bySort = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

const toTile = (c, parentColor) => ({
  id: c.id,
  label: c.name,
  slug: c.slug ?? '',
  glyph: c.icon,
  color: HEX.test(c.color ?? '') ? c.color : parentColor || CATEGORY_ACCENT,
  count: c.worker_count ?? 0,
});

// Yo'nalishlar ro'yxati (GET /categories). `categories` — asosiy yo'nalishlar kartochkaga tayyor
// ko'rinishda, har birida `children` (quyi yo'nalishlar). `all` — asosiy va quyi yo'nalishlar
// tekis ro'yxatda (id bo'yicha topish va qidiruv uchun). `popular` — ustasi bor yo'nalishlar,
// ustalar soni bo'yicha kamayish tartibida.
export default function useCategories() {
  const { tree, loading } = useCategoryTreeQuery();

  const categories = useMemo(
    () =>
      [...tree].sort(bySort).map((c) => {
        const tile = toTile(c);
        return {
          ...tile,
          children: [...(c.children ?? [])].sort(bySort).map((ch) => ({
            ...toTile(ch, tile.color),
            parentId: tile.id,
          })),
        };
      }),
    [tree]
  );

  const all = useMemo(() => categories.flatMap((c) => [c, ...c.children]), [categories]);

  const popular = useMemo(
    () => categories.filter((c) => c.count > 0).sort((a, b) => b.count - a.count),
    [categories]
  );

  return { categories, all, popular, loading };
}
