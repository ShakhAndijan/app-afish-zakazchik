import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationsPage,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';

const UNREAD_KEY = ['notifications', 'unread'];
const LIST_KEY = ['notifications', 'list'];
const POLL_MS = 60 * 1000;

/** O'qilmagan bildirishnomalar soni (qo'ng'iroqcha belgisi); ilova ochiq turganda har daqiqada yangilanadi. */
export function useUnreadNotifications(enabled = true) {
  const q = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: getUnreadNotificationCount,
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: POLL_MS,
  });
  return q.data ?? 0;
}

export function useNotificationsFeed() {
  const q = useInfiniteQuery({
    queryKey: LIST_KEY,
    queryFn: ({ pageParam }) => getNotificationsPage({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (all.length < last.pages ? all.length + 1 : undefined),
  });
  return {
    items: q.data?.pages.flatMap((p) => p.items) ?? [],
    loading: q.isPending,
    error: q.isError,
    refetch: q.refetch,
    refreshing: q.isRefetching && !q.isFetchingNextPage,
    fetchMore: () => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage(),
    fetchingMore: q.isFetchingNextPage,
  };
}

const markInCache = (queryClient, predicate) =>
  queryClient.setQueryData(LIST_KEY, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n) => (predicate(n) ? { ...n, isRead: true } : n)),
          })),
        }
      : data
  );

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (count, id) => {
      queryClient.setQueryData(UNREAD_KEY, count);
      markInCache(queryClient, (n) => n.id === id);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (count) => {
      queryClient.setQueryData(UNREAD_KEY, count);
      markInCache(queryClient, () => true);
    },
  });
}
