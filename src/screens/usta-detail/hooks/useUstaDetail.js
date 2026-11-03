import { useEffect, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { getWorkerReviewsPage, getWorkerCompletedJobsPage } from '../../../api/reviews';
import {
  getWorkerById,
  getWorkerCertificates,
  getFavoritesPage,
  favoriteWorker,
  unfavoriteWorker,
} from '../../../api/workers';

import { trackEvent } from '../../../utils/analytics';

const workerKey = (id) => ['worker', id];

// Sahifalab yuklanadigan ro'yxat (sharhlar, bajarilgan ishlar): sahifalar bitta massivga yig'iladi.
function usePagedList(key, workerId, fetchPage) {
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(workerId, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    enabled: !!workerId,
  });
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  return {
    items,
    total: query.data?.pages[0]?.total ?? 0,
    loading: query.isPending && !!workerId,
    hasMore: !!query.hasNextPage,
    fetchingMore: query.isFetchingNextPage,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
  };
}

// Usta ekranining ma'lumotlari: batafsil profil, tanlangan yo'nalish bo'yicha sertifikatlar
// va "yoqtirish" (sevimli) holati. Profil va sertifikatlar keshlanadi: ustaga qayta kirilganda
// darhol ko'rinadi va fonda yangilanadi.
export default function useUstaDetail(usta) {
  const queryClient = useQueryClient();
  const workerId = usta?.id;

  const detailQuery = useQuery({
    queryKey: workerKey(workerId),
    queryFn: () => getWorkerById(workerId),
    enabled: !!workerId,
  });
  const detail = detailQuery.data ?? null;

  useEffect(() => {
    if (workerId) trackEvent('worker_viewed');
  }, [workerId]);

  // Foydalanuvchi tanlamaguncha — ustaning asosiy yo'nalishi.
  const [pickedCategoryId, setSelectedCategoryId] = useState(undefined);
  const selectedCategoryId =
    pickedCategoryId !== undefined ? pickedCategoryId : (detail?.mainCategoryId ?? null);

  const certificatesQuery = useQuery({
    queryKey: [...workerKey(detail?.id), 'certificates', selectedCategoryId],
    queryFn: () => getWorkerCertificates(detail.id, selectedCategoryId),
    enabled: !!detail?.id,
    placeholderData: keepPreviousData,
  });

  const reviews = usePagedList([...workerKey(workerId), 'reviews'], workerId, getWorkerReviewsPage);
  const completedJobs = usePagedList(
    [...workerKey(workerId), 'completed-jobs'],
    workerId,
    getWorkerCompletedJobsPage
  );

  // Profil javobida sevimli belgisi yo'q: holat sevimlilar ro'yxatidan olinadi (sayt ham shunday;
  // FavoritesScreen bilan bir xil kalit, shuning uchun kesh umumiy).
  const favoritesQuery = useQuery({
    queryKey: ['favorites', 'list'],
    queryFn: () => getFavoritesPage({ size: 100 }),
    enabled: !!workerId,
  });
  const favorited = favoritesQuery.data?.items.some((w) => w.id === workerId) ?? false;

  // Optimistik: avval holat o'zgaradi, so'rov xato bersa qaytariladi.
  const [likeOverride, setLikeOverride] = useState(null);
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const liked = likeOverride ?? favorited;

  const toggleLike = () => {
    const id = workerId ?? detail?.id;
    if (!id || likeSubmitting) return;
    const next = !liked;
    setLikeOverride(next);
    setLikeSubmitting(true);
    (next ? favoriteWorker(id) : unfavoriteWorker(id))
      .catch(() => setLikeOverride(!next))
      .finally(() => {
        setLikeSubmitting(false);
        // Ro'yxat, bosh sahifadagi sevimlilar va profildagi son yangilansin.
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      });
  };

  return {
    detail,
    loadingDetail: detailQuery.isLoading,
    certificates: certificatesQuery.data ?? [],
    loadingCertificates: certificatesQuery.isFetching,
    selectedCategoryId,
    setSelectedCategoryId,
    liked,
    toggleLike,
    reviews,
    completedJobs,
  };
}
