import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import SectionTitle from './SectionTitle';
import ReviewCard from './ReviewCard';

// Mijozlarning ustaga bergan baholari ("Hammasi" / "Suratli" filtri bilan, sahifalab yuklanadi).
// Baho bo'lmasa — chizilmaydi.
export default function ReviewsSection({
  reviews,
  filter,
  onFilterChange,
  hasMore,
  fetchingMore,
  onLoadMore,
}) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  if (reviews.length === 0) return null;

  const shown = filter === 'photo' ? reviews.filter((p) => p.photos?.length) : reviews;
  const filters = [
    ['all', tr('ustaDetail.reviewFilterAll')],
    ['photo', tr('ustaDetail.reviewFilterPhoto')],
  ];

  return (
    <>
      <SectionTitle
        icon="comment-text-outline"
        title={tr('ustaDetail.reviewsTitle')}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {filters.map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => onFilterChange(key)}
                style={[st.filterChip, filter === key && st.filterChipOn]}
                activeOpacity={0.75}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: filter === key ? C.orange : C.txt,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      <View style={{ gap: 12 }}>
        {shown.map((p) => (
          <ReviewCard key={p.id} item={p} />
        ))}
        {shown.length === 0 && (
          <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
            <Text style={{ fontSize: 12.5, color: C.dim }}>
              {tr('ustaDetail.reviewsPhotoEmpty')}
            </Text>
          </View>
        )}
        {hasMore && (
          <TouchableOpacity
            onPress={onLoadMore}
            disabled={fetchingMore}
            activeOpacity={0.8}
            style={[st.card, { padding: 13, alignItems: 'center' }]}
          >
            {fetchingMore ? (
              <ActivityIndicator color={C.orange} />
            ) : (
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.orange }}>
                {tr('ustaDetail.reviewsMore')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
