import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, focusManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ApiError } from '../utils/request';

// Ilova foreground'ga qaytganda "eskirgan" so'rovlar jimgina yangilanadi.
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => handleFocus(state === 'active'));
  return () => sub.remove();
});

// 4xx xatolarda (masalan 404, 422) qayta urinishdan foyda yo'q; tarmoq va 5xx da 2 marta urinadi.
// 401 ni apiClient o'zi hal qiladi (refresh token).
function shouldRetry(failureCount, error) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 60 * 1000,
      // gcTime >= persistMaxAge bo'lishi shart, aks holda diskdan tiklangan kesh darhol o'chib ketadi.
      gcTime: PERSIST_MAX_AGE,
      refetchOnReconnect: true,
    },
  },
});

// Diskka faqat hamma uchun bir xil, shaxsiy bo'lmagan ma'lumotlar yoziladi — ilova ochilganda
// bosh sahifa bo'sh turmasin. Foydalanuvchi, buyurtmalar, sevimlilar va hokazo kirmaydi.
const isPersistable = (query) => {
  const [root, second] = query.queryKey;
  if (root === 'categories') return true;
  if (root === 'legal' || root === 'articles') return true; // hujjatlar hamma uchun bir xil; oflaynda ham ochilsin
  if (root === 'workers' && second === 'top') return true;
  if (root === 'home' && ['works', 'reviews', 'stats'].includes(second)) return true;
  return false;
};

export const persistOptions = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'rq_cache_v1',
    throttleTime: 2000,
  }),
  maxAge: PERSIST_MAX_AGE,
  // Kesh tuzilishi o'zgarsa shu qiymatni oshiring — eski disk keshi tashlab yuboriladi.
  buster: '1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.state.status === 'success' && isPersistable(query),
  },
};
