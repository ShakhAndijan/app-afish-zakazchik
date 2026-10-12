import { useQuery } from '@tanstack/react-query';
import { getWorkersPage } from '../../../api/workers';

const EMPTY = [];

// Bosh ro'yxatdagi tasdiqlangan ustalar ("Faqat sertifikatlangan" yoqilganda yuklanadi).
export default function useVerifiedWorkers(enabled) {
  const { data, isFetching } = useQuery({
    queryKey: ['workers', 'verified'],
    queryFn: () => getWorkersPage({ verifiedOnly: true, page: 1, size: 20 }),
    enabled,
  });
  return { items: data?.items ?? EMPTY, total: data?.total ?? null, loading: isFetching };
}
