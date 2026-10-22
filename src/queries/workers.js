import { useInfiniteQuery } from '@tanstack/react-query';
import { getWorkersPage } from '../api/workers';

const PAGE_SIZE = 20;
const EMPTY = [];

const dedupe = (pages) => {
  const seen = new Set();
  return pages.flatMap((p) => p.items).filter((w) => (seen.has(w.id) ? false : seen.add(w.id)));
};

/**
 * Barcha ustalar (cheksiz ro'yxat). `filters`: { q, regionId, districtId, minRating, verifiedOnly,
 * isOnline, badge, sort, nearLat, nearLon } — hammasi serverga so'rov parametri bo'lib ketadi.
 * `pageSize` — sahifa hajmi (xaritada ko'proq usta kerak bo'ladi).
 * @returns {{ items, total, loading, error, refreshing, fetchingMore, loadMore, refetch }}
 */
export function useWorkersFeed(filters, pageSize = PAGE_SIZE) {
  const query = useInfiniteQuery({
    queryKey: ['workers', 'feed', filters, pageSize],
    queryFn: ({ pageParam }) => getWorkersPage({ ...filters, page: pageParam, size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => {
      if (last.items.length === 0) return undefined;
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      const more = last.total != null ? loaded < last.total : last.items.length === pageSize;
      return more ? all.length + 1 : undefined;
    },
    staleTime: 60 * 1000,
  });

  return {
    items: query.data ? dedupe(query.data.pages) : EMPTY,
    total: query.data?.pages[0]?.total ?? null,
    loading: query.isPending,
    error: query.isError && !query.data,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    fetchingMore: query.isFetchingNextPage,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
    refetch: query.refetch,
  };
}
