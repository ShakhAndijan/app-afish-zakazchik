import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories';
import { queryClient } from './client';

const EMPTY = [];

// Keshda backend daraxti saqlanadi (asosiy yo'nalish + `children`); ekranlarga kerakli ko'rinish `select` bilan beriladi.

// Asosiy yo'nalishlar, quyi yo'nalishlarsiz — bosh sahifa va mehmon sahifasidagi kartalar uchun (avvalgi tekis ro'yxat).
const selectTopLevel = (tree) =>
  tree.filter((c) => c.parent_id == null).map(({ children, ...rest }) => rest);

// Barcha yo'nalishlar (asosiy + quyi) tekis ro'yxatda — id bo'yicha nom topish uchun.
const selectAll = (tree) => tree.flatMap(({ children, ...rest }) => [rest, ...(children ?? [])]);

// Asosiy yo'nalishlar `children` bilan — "Yangi buyurtma"dagi ikki bosqichli tanlov uchun.
const selectTree = (tree) => tree.filter((c) => c.parent_id == null);

// Yo'nalishlar kamdan-kam o'zgaradi: 10 daqiqa yangi hisoblanadi, ilovadagi barcha ekranlar bitta keshni ishlatadi.
export const categoriesQuery = {
  queryKey: ['categories'],
  queryFn: getCategories,
  staleTime: 10 * 60 * 1000,
  select: selectTopLevel,
};

// Komponentlar uchun: asosiy yo'nalishlar ro'yxati (yuklanmaguncha bo'sh massiv) va holatlar.
export function useCategoriesQuery() {
  const { data, isPending, isError, refetch } = useQuery(categoriesQuery);
  return { categories: data ?? EMPTY, loading: isPending, error: isError, refetch };
}

// Asosiy va quyi yo'nalishlar birgalikda (masalan, buyurtmadagi yo'nalish nomini topish uchun).
export function useAllCategoriesQuery() {
  const { data } = useQuery({ ...categoriesQuery, select: selectAll });
  return { categories: data ?? EMPTY };
}

// Daraxt ko'rinishi: asosiy yo'nalishlar va ularning `children`i.
export function useCategoryTreeQuery() {
  const { data, isPending } = useQuery({ ...categoriesQuery, select: selectTree });
  return { tree: data ?? EMPTY, loading: isPending };
}

// Hook bo'lmagan joylar uchun (imperativ yuklash): kesh yangi bo'lsa tarmoqqa chiqmaydi.
export const fetchCategories = () => queryClient.fetchQuery(categoriesQuery);
