import { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPublicOrder } from '../../../api/reviews';
import { formatTimeAgo } from '../../../utils/timeAgo';
import { mockWorkDetails } from '../mock';
import { colorForName } from '../utils';

// Ish tafsilotlari. Har bir maydon: backenddan kelgan qiymat bo'lsa — o'sha, bo'lmasa namuna
// (shunda backend yangi maydon qo'shsa, ekranda o'zi paydo bo'ladi).
//
// Qaytaradi:
//  - details:  ekranda ko'rsatiladigan qiymatlar (real yoki namuna)
//  - isMock:   qaysi bo'limlar namuna ma'lumotga tayanadi ("Namuna ma'lumot" belgisi uchun)
//  - beforePhotos: "oldin" suratlari
export default function useWorkDetails(work) {
  const { t: tr } = useLanguage();
  const rating = typeof work?.rating === 'number' ? work.rating : 0;

  // Ochiq buyurtma (public_token): haqiqiy kategoriya va yakunlangan sana. Xato bo'lsa
  // ekran 'top-orders' ma'lumoti va namuna qiymatlar bilan ishlayveradi.
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

  const mock = mockWorkDetails(work);
  const realCategory = pub?.category?.name ?? work?.category ?? null;
  const realLocation = work?.location ?? null;
  const realDate = pub?.completed_at ?? work?.completedAt ?? pub?.created_at ?? work?.createdAt ?? null;
  const realPostedAgo = realDate ? formatTimeAgo(realDate, tr) : '';
  const realPrice = Number(work?.price) > 0 ? Number(work.price) : null;
  const realDuration = work?.duration ? String(work.duration) : null;
  const reviewerName = work?.review?.user?.full_name ?? work?.review?.name ?? '';
  const realReview = work?.review?.text
    ? {
        name: reviewerName,
        initial: reviewerName ? reviewerName[0].toUpperCase() : '?',
        color: colorForName(reviewerName),
        rating: work.review.rating ?? rating,
        text: work.review.text,
      }
    : null;

  const details = {
    category: realCategory ?? mock.category,
    location: realLocation ?? mock.location,
    postedAgo: realPostedAgo || mock.postedAgo,
    duration: realDuration ?? mock.duration,
    price: realPrice ?? mock.price,
    priceMaterial: mock.priceMaterial,
    priceLabor: mock.priceLabor,
    masterNote: mock.masterNote, // backendda usta izohi yo'q — doim namuna
    customerReview: realReview ?? mock.customerReview,
  };

  const isMock = {
    meta: !realLocation || !realPostedAgo || !realCategory,
    // Materiallar/ish haqi bo'linishi backendda yo'q: narx namuna bo'lsagina ko'rsatiladi.
    priceSplit: !realPrice,
    priceSection: !realPrice || !realDuration,
    masterNote: true,
    review: !realReview,
  };

  return {
    details,
    isMock,
    beforePhotos: pub?.before_photos ?? work?.beforePhotos ?? [],
  };
}
