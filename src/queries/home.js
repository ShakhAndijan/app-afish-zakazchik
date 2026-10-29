import { getWorkers } from '../api/workers';
import { getTopComments } from '../api/reviews';
import { getSystemStats } from '../api/stats';
import { categoriesQuery } from './categories';
import { queryClient } from './client';

const MIN = 60 * 1000;

// Bosh sahifaning hamma uchun bir xil (token talab qilmaydigan) bo'limlari. Kalitlar `client.js`dagi
// `isPersistable` bilan mos bo'lishi shart: shu so'rovlar diskka yoziladi.
export const topWorkersQuery = (categoryId = null) => ({
  queryKey: ['workers', 'top', categoryId],
  queryFn: () => getWorkers({ page: 1, size: 5, categoryId }),
});

export const homeStatsQuery = {
  queryKey: ['home', 'stats'],
  queryFn: async () => (await getSystemStats()) ?? null,
  staleTime: 10 * MIN,
};

export const homeReviewsQuery = {
  queryKey: ['home', 'reviews'],
  queryFn: () => getTopComments({ limit: 10 }),
  staleTime: 5 * MIN,
};

// Ilova ochilishi bilan (sessiya tekshiruvi va navigatsiyani kutmasdan) bosh sahifaning ommaviy
// ma'lumotlarini yuklashni boshlaydi. Ekran ochilganda ma'lumot tayyor yoki yo'lda bo'ladi.
// Xato bo'lsa jimgina o'tib ketadi — ekranning o'z so'rovi qayta urinadi.
export function prefetchPublicHome() {
  [categoriesQuery, topWorkersQuery(), homeStatsQuery, homeReviewsQuery].forEach((q) =>
    queryClient.prefetchQuery(q)
  );
}
