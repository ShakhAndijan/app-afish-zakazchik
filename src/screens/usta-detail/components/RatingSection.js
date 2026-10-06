import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import EmptyState from './EmptyState';

function RatingBar({ label, pct }) {
  const { st } = useUstaStyles();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={st.barLabel}>{label}</Text>
      <View style={st.barTrack}>{pct > 0 && <View style={[st.barFill, { width: pct + '%' }]} />}</View>
      <Text style={st.barPct}>{pct}%</Text>
    </View>
  );
}

// Reyting kartochkasi: o'rtacha baho, sharhlar soni va 5★–1★ taqsimoti.
// `reviewCount` — backenddan; `reviewItemsCount` — portfoliodagi baholangan ishlar soni.
export default function RatingSection({ rating, rawRating, reviewCount, reviewItemsCount, ratingBreakdown }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();

  // Backend review_count'ni noto'g'ri (0) qaytarishi mumkin, garchi overall_rating
  // yoki portfoliodagi baholangan ishlar mavjud bo'lsa ham — shu holatda "sharhlar
  // tez orada" bo'sh holatini emas, haqiqiy reytingni ko'rsatamiz.
  const hasRating = typeof rawRating === 'number' && rawRating > 0;
  const effectiveReviewCount = reviewCount > 0 ? reviewCount : reviewItemsCount;
  const showRatingCard = effectiveReviewCount > 0 || hasRating;

  // Necha xil yulduz darajasida baho borligi (masalan 4 va 3) — shu asosda
  // o'rtacha qiymatni alohida ko'rsatish kerakligini aniqlaymiz.
  const distinctStarLevels = ratingBreakdown
    ? Object.values(ratingBreakdown).filter((c) => c > 0).length
    : 0;
  const showAverageLabel = distinctStarLevels > 1;

  return (
    <>
      <Text style={[st.secTitle, { marginTop: 22 }]}>{tr('ustaDetail.ratingTitle')}</Text>
      {showRatingCard ? (
        <View style={st.card}>
          <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center', padding: 16 }}>
            <View style={{ alignItems: 'center', minWidth: 68 }}>
              {showAverageLabel && (
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: '700',
                    color: C.dim,
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                  }}
                >
                  {tr('ustaDetail.averageRatingLabel')}
                </Text>
              )}
              <Text style={{ fontSize: 38, fontWeight: '800', color: C.txt, lineHeight: 42 }}>
                {rating}
              </Text>
              <View style={{ flexDirection: 'row', gap: 2, marginTop: 6 }}>
                {[...Array(5)].map((_, k) => (
                  <Ionicons key={k} name="star" size={13} color={C.gold} />
                ))}
              </View>
              {effectiveReviewCount > 0 && (
                <Text style={{ fontSize: 11.5, color: C.dim, marginTop: 5 }}>
                  {tr('ustaDetail.reviewsCount', { count: effectiveReviewCount })}
                </Text>
              )}
            </View>
            {ratingBreakdown && effectiveReviewCount > 0 && (
              <View style={{ flex: 1, gap: 7 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingBreakdown[star] ?? 0;
                  const pct = Math.round((count / effectiveReviewCount) * 100);
                  return <RatingBar key={star} label={`${star}★`} pct={pct} />;
                })}
              </View>
            )}
          </View>
        </View>
      ) : (
        <EmptyState
          icon="chatbubbles-outline"
          iconSet={Ionicons}
          title={tr('ustaDetail.reviewsEmptyTitle')}
          subtitle={tr('ustaDetail.reviewsEmptySubtitle')}
        />
      )}
    </>
  );
}
