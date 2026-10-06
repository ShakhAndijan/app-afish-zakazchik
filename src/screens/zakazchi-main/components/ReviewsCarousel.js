import { View, Text, FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatTimeAgo } from '../../../utils/timeAgo';
import Avatar from '../../../components/Avatar';
import SectionHeader from './SectionHeader';
import SectionLoader from './SectionLoader';

// "Mijozlar fikri" bo'limi. Ixtiyoriy kontent: xato bo'lsa yoki sharh yo'q bo'lsa ko'rinmaydi.
export default function ReviewsCarousel({ state }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  if (state.loading) {
    return (
      <View style={{ marginTop: 24 }}>
        <SectionLoader height={150} />
      </View>
    );
  }

  const reviews = state.data ?? [];
  if (state.error || reviews.length === 0) return null;

  return (
    <View style={{ marginTop: 24 }}>
      <SectionHeader title={tr('app.sectionHead.reviews')} style={{ paddingHorizontal: 20 }} />
      <FlatList
        data={reviews}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        renderItem={({ item: r }) => (
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={{ flexDirection: 'row', gap: 3, marginBottom: 10 }}>
              {[0, 1, 2, 3, 4].map((j) => (
                <Ionicons key={j} name="star" size={13} color={j < r.stars ? t.gold : t.border} />
              ))}
            </View>
            <Text
              style={{ color: t.muted, fontSize: 13, lineHeight: 19, marginBottom: 14 }}
              numberOfLines={4}
            >
              {r.text}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar letter={r.initial} size={34} bgColor={r.color} />
              <View>
                <Text style={{ color: t.text, fontWeight: '600', fontSize: 13 }}>{r.name}</Text>
                <Text style={{ color: t.faint, fontSize: 11, marginTop: 1 }}>
                  {formatTimeAgo(r.createdAt, tr)}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
});
