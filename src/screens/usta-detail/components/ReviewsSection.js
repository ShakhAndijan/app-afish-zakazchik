import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useUstaStyles } from '../styles';
import ReviewCard from './ReviewCard';

// Sharhlar ro'yxati ("Hammasi" / "Suratli" filtri bilan). Baholangan ish bo'lmasa — chizilmaydi.
export default function ReviewsSection({ reviewItems, filter, onFilterChange }) {
  const { t: tr } = useLanguage();
  const { C, st } = useUstaStyles();
  if (reviewItems.length === 0) return null;

  const shown = filter === 'photo' ? reviewItems.filter((p) => p.photos?.length) : reviewItems;
  const filters = [
    ['all', tr('ustaDetail.reviewFilterAll')],
    ['photo', tr('ustaDetail.reviewFilterPhoto')],
  ];

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 22,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '800', color: C.txt }}>
          {tr('ustaDetail.reviewsTitle')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {filters.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => onFilterChange(key)}
              style={[st.filterChip, filter === key && st.filterChipOn]}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: filter === key ? C.orange : C.txt }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {shown.map((p) => (
          <ReviewCard key={p.id} item={p} />
        ))}
        {shown.length === 0 && (
          <View style={[st.card, { padding: 16, alignItems: 'center' }]}>
            <Text style={{ fontSize: 12.5, color: C.dim }}>{tr('ustaDetail.reviewsPhotoEmpty')}</Text>
          </View>
        )}
      </View>
    </>
  );
}
