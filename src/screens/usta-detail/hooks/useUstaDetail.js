import { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getWorkerById,
  getWorkerCertificates,
  likeWorker,
  unlikeWorker,
} from '../../../api/workers';

const workerKey = (id) => ['worker', id];

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

  // Optimistik: avval holat o'zgaradi, so'rov xato bersa qaytariladi.
  const [likeOverride, setLikeOverride] = useState(null);
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const liked = likeOverride ?? !!detail?.isLiked;

  const toggleLike = () => {
    const id = workerId ?? detail?.id;
    if (!id || likeSubmitting) return;
    const next = !liked;
    setLikeOverride(next);
    setLikeSubmitting(true);
    (next ? likeWorker(id) : unlikeWorker(id))
      .then(() => {
        // Keshdagi profil ham yangi holatni bilsin (ustaga qaytganda eski belgi chiqmasin).
        queryClient.setQueryData(workerKey(id), (d) => (d ? { ...d, isLiked: next } : d));
      })
      .catch(() => setLikeOverride(!next))
      .finally(() => {
        setLikeSubmitting(false);
        // Bosh sahifadagi sevimlilar va profildagi son yangilansin.
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
  };
}
