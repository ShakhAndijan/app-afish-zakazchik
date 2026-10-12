import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories';
import { queryClient } from './client';

const EMPTY = [];

// Yo'nalishlar kamdan-kam o'zgaradi: 10 daqiqa yangi hisoblanadi, ilovadagi barcha ekranlar bitta keshni ishlatadi.
export const categoriesQuery = {
  queryKey: ['categories'],
  queryFn: getCategories,
  staleTime: 10 * 60 * 1000,
};

// Komponentlar uchun: ro'yxat (yuklanmaguncha bo'sh massiv) va holatlar.
export function useCategoriesQuery() {
  const { data, isPending, isError, refetch } = useQuery(categoriesQuery);
  return { categories: data ?? EMPTY, loading: isPending, error: isError, refetch };
}

// Hook bo'lmagan joylar uchun (imperativ yuklash): kesh yangi bo'lsa tarmoqqa chiqmaydi.
export const fetchCategories = () => queryClient.fetchQuery(categoriesQuery);
