import { useState, useEffect } from 'react';
import {
  getWorkerById,
  getWorkerCertificates,
  likeWorker,
  unlikeWorker,
} from '../../../api/workers';

// Usta ekranining ma'lumotlari: batafsil profil, tanlangan yo'nalish bo'yicha sertifikatlar
// va "yoqtirish" (sevimli) holati.
export default function useUstaDetail(usta) {
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeSubmitting, setLikeSubmitting] = useState(false);

  useEffect(() => {
    if (!usta?.id) return;
    let cancelled = false;
    setLoadingDetail(true);
    setCertificates([]);
    getWorkerById(usta.id)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setLiked(!!data.isLiked);
          setSelectedCategoryId(data.mainCategoryId ?? null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [usta?.id]);

  useEffect(() => {
    if (!detail?.id) return;
    let cancelled = false;
    setLoadingCertificates(true);
    getWorkerCertificates(detail.id, selectedCategoryId)
      .then((data) => {
        if (!cancelled) setCertificates(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingCertificates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail?.id, selectedCategoryId]);

  // Optimistik: avval holat o'zgaradi, so'rov xato bersa qaytariladi.
  const toggleLike = () => {
    const workerId = usta?.id ?? detail?.id;
    if (!workerId || likeSubmitting) return;
    const next = !liked;
    setLiked(next);
    setLikeSubmitting(true);
    (next ? likeWorker(workerId) : unlikeWorker(workerId))
      .catch(() => setLiked(!next))
      .finally(() => setLikeSubmitting(false));
  };

  return {
    detail,
    loadingDetail,
    certificates,
    loadingCertificates,
    selectedCategoryId,
    setSelectedCategoryId,
    liked,
    toggleLike,
  };
}
