import { useState, useEffect, useRef, useCallback } from 'react';
import { getMyOrders } from '../../../api/orders';
import { getCategories } from '../../../api/categories';

// Mijoz buyurtmalarini yuklaydi. Ro'yxatda faqat category_id bor, shuning uchun
// xizmat nomi kategoriyalar ro'yxatidan olinadi (u yuklanmasa ham ro'yxat chiqadi).
export default function useMyOrders() {
  const [orders, setOrders] = useState(null); // null — hali yuklanmagan
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const [list, categories] = await Promise.all([
        getMyOrders(),
        getCategories().catch(() => []),
      ]);
      if (!mounted.current) return;
      const names = new Map(categories.map((c) => [c.id, c.name]));
      setOrders(list.map((o) => ({ ...o, service: o.service ?? names.get(o.categoryId) ?? null })));
      setError(false);
    } catch {
      // Yangilash muvaffaqiyatsiz bo'lsa, avval yuklangan ro'yxat saqlanadi.
      if (mounted.current) setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    if (mounted.current) setRefreshing(false);
  }, [load]);

  const retry = useCallback(() => {
    setError(false);
    load();
  }, [load]);

  return {
    orders,
    initialLoading: orders === null && !error,
    failed: orders === null && error,
    refreshing,
    refresh,
    retry,
  };
}
