import { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPublicOrder } from '../../../api/reviews';
import { formatTimeAgo } from '../../../utils/timeAgo';
import { colorForName } from '../utils';

// Ish tafsilotlari: faqat backend bergan ma'lumot. Ochiq buyurtma (`public_token`) narx, joy va tavsifni
// mijoz maxfiyligi uchun ataylab bermaydi, shuning uchun ular ko'rsatilmaydi.
//
// Qaytaradi:
//  - details:  kategoriya, "qachon bajarilgan", usta tavsifi (portfolio) va (bo'lsa) mijoz sharhi
//  - beforePhotos: "oldin" suratlari
export default function useWorkDetails(work) {
  const { t: tr } = useLanguage();
  const rating = typeof work?.rating === 'number' ? work.rating : 0;

  // Ochiq buyurtma (public_token): haqiqiy kategoriya va yakunlangan sana. Xato bo'lsa
  // ekran ro'yxatdan kelgan ma'lumot bilan ishlayveradi.
  const [pub, setPub] = useState(null);
  const publicToken = work?.publicToken;
  useEffect(() => {
    if (!publicToken) return;
    let cancelled = false;
    getPublicOrder(publicToken)
      .then((o) => !cancelled && setPub(o))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [publicToken]);

  const date =
    pub?.completed_at ??
    work?.completedAt ??
    work?.workDate ??
    pub?.created_at ??
    work?.createdAt ??
    null;
  const reviewerName = work?.review?.user?.full_name ?? work?.review?.name ?? '';
  const customerReview = work?.review?.text
    ? {
        name: reviewerName,
        initial: reviewerName ? reviewerName[0].toUpperCase() : '?',
        color: colorForName(reviewerName),
        rating: work.review.rating ?? rating,
        text: work.review.text,
      }
    : null;

  const details = {
    category: pub?.category?.name ?? work?.category ?? null,
    postedAgo: date ? formatTimeAgo(date, tr) : '',
    description: work?.description?.trim() || null,
    customerReview,
  };

  return {
    details,
    beforePhotos: pub?.before_photos ?? work?.beforePhotos ?? [],
  };
}
