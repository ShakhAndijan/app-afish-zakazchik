import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../../../api/orders';
import { useAllCategoriesQuery } from '../../../queries/categories';

export const MY_ORDERS_KEY = ['orders', 'list'];

// Mijoz buyurtmalarini yuklaydi. Ro'yxatda faqat category_id bor, shuning uchun
// xizmat nomi kategoriyalar ro'yxatidan olinadi (u yuklanmasa ham ro'yxat chiqadi).
export default function useMyOrders() {
  const [refreshing, setRefreshing] = useState(false);
  const { categories } = useAllCategoriesQuery();
  const query = useQuery({ queryKey: MY_ORDERS_KEY, queryFn: getMyOrders, staleTime: 30 * 1000 });
  const { data, isError, isFetching, refetch } = query;

  // null — hali yuklanmagan. Yangilash xato bersa, avval yuklangan ro'yxat saqlanadi.
  const orders = useMemo(() => {
    if (!data) return null;
    const names = new Map(categories.map((c) => [c.id, c.name]));
    return data.map((o) => ({ ...o, service: o.service ?? names.get(o.categoryId) ?? null }));
  }, [data, categories]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    orders,
    initialLoading: orders === null && (!isError || isFetching),
    failed: orders === null && isError && !isFetching,
    refreshing,
    refresh,
    retry: refetch,
  };
}
