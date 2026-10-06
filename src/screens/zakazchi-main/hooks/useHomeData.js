import { useState, useRef, useEffect, useCallback } from 'react';
import { getCategories } from '../../../api/categories';
import { getWorkers, getFavorites } from '../../../api/workers';
import { getTopOrders, getTopComments } from '../../../api/reviews';
import { getSystemStats } from '../../../api/stats';
import { getRecentOrders } from '../../../api/orders';
import { devLog } from '../../../utils/log';

// Mijozning shaxsiy xulosasi: faol buyurtmalar va qayta buyurtma berish mumkin bo'lgan
// oxirgi bajarilgan buyurtma. Buyurtmalar ro'yxati olinmasa ham xato emas — bo'sh xulosa.
async function loadSummary() {
  const orders = await getRecentOrders(30).catch(() => []);
  return {
    activeOrders: orders.filter((o) => o.status === 'active'),
    lastDone: orders.find((o) => o.status === 'done' && o.workerId != null) ?? null,
  };
}

// Har bir bo'lim: { data: null | ma'lumot, loading, error }
//  - data === null  → hali birorta muvaffaqiyatli javob kelmagan
//  - error          → so'rov xato bergan va ko'rsatadigan ma'lumot yo'q
const idle = () => ({ data: null, loading: true, error: false });

// Bosh sahifa ma'lumotlari: har bir bo'lim mustaqil yuklanadi — biri xato bersa,
// qolganlari baribir o'z holatini yangilaydi.
export default function useHomeData() {
  const [categories, setCategories] = useState(idle);
  const [workers, setWorkers] = useState(idle);
  const [works, setWorks] = useState(idle);
  const [favorites, setFavorites] = useState(idle);
  const [stats, setStats] = useState(idle);
  const [reviews, setReviews] = useState(idle);
  const [summary, setSummary] = useState(idle);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(true);
  // Yangilash (pull-to-refresh) ham tanlangan kategoriyani hisobga olishi uchun
  const categoryRef = useRef(null);
  // Kategoriya tez-tez almashtirilganda eski javob yangisini bosib ketmasin
  const workersReqRef = useRef(0);

  // silent: true — fon rejimida yangilash (mavjud ma'lumot yo'qolmaydi, xato bo'lsa
  // eski ma'lumot saqlanadi). false — foydalanuvchi harakati: loader ko'rsatiladi,
  // xato bo'lsa xato holati chiqadi.
  const loadSection = useCallback((name, setState, fetcher, { silent = false, isStale } = {}) => {
    setState((prev) =>
      silent && prev.data !== null ? prev : { ...prev, loading: true, error: false }
    );
    return fetcher()
      .then((data) => {
        if (!mountedRef.current || isStale?.()) return;
        setState({ data, loading: false, error: false });
      })
      .catch((err) => {
        devLog(`[home] ${name} error:`, err?.message ?? err);
        if (!mountedRef.current || isStale?.()) return;
        setState((prev) =>
          silent && prev.data !== null
            ? { ...prev, loading: false }
            : { ...prev, loading: false, error: true }
        );
      });
  }, []);

  const loadWorkers = useCallback(
    ({ silent = false } = {}) => {
      const id = ++workersReqRef.current;
      return loadSection(
        'workers',
        setWorkers,
        () => getWorkers({ page: 1, size: 5, categoryId: categoryRef.current }),
        { silent, isStale: () => id !== workersReqRef.current }
      );
    },
    [loadSection]
  );

  const sourcesRef = useRef({
    categories: [setCategories, () => getCategories()],
    works: [setWorks, () => getTopOrders({ limit: 10 })],
    favorites: [setFavorites, () => getFavorites({ page: 1, size: 10 })],
    stats: [setStats, () => getSystemStats()],
    reviews: [setReviews, () => getTopComments({ limit: 10 })],
    summary: [setSummary, loadSummary],
  });

  const loadAll = useCallback(
    () =>
      Promise.allSettled([
        ...Object.entries(sourcesRef.current).map(([name, [setState, fetcher]]) =>
          loadSection(name, setState, fetcher, { silent: true })
        ),
        loadWorkers({ silent: true }),
      ]),
    [loadSection, loadWorkers]
  );

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    return () => {
      mountedRef.current = false;
    };
  }, [loadAll]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    return loadAll().finally(() => setRefreshing(false));
  }, [loadAll]);

  // Foydalanuvchi xato bergan bo'limni qayta yuklaydi
  const retry = useCallback(
    (name) => {
      if (name === 'workers') return loadWorkers();
      const [setState, fetcher] = sourcesRef.current[name];
      return loadSection(name, setState, fetcher);
    },
    [loadSection, loadWorkers]
  );

  const selectCategory = useCallback(
    (id) => {
      categoryRef.current = id;
      setSelectedCategoryId(id);
      loadWorkers();
    },
    [loadWorkers]
  );

  // Bosh sahifaga qaytilganda shaxsiy xulosa (faol buyurtmalar) jimgina yangilanadi.
  const refreshSummary = useCallback(
    () => loadSection('summary', setSummary, loadSummary, { silent: true }),
    [loadSection]
  );

  const sections = { categories, workers, works, favorites, stats, reviews, summary };
  const all = Object.values(sections);

  return {
    ...sections,
    selectedCategoryId,
    selectCategory,
    refreshing,
    refresh,
    refreshSummary,
    retry,
    initialLoading: all.every((s) => s.loading),
    allFailed: all.every((s) => s.error),
  };
}
