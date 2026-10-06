import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';
import EmptyCard from './EmptyCard';

// "Eng zo'r ustalar" ro'yxati. Ma'lumot (`state`) va kategoriya bo'yicha filtr
// `useHomeData` da boshqariladi — shuning uchun pull-to-refresh bu yerni ham yangilaydi.
export default function TopWorkers({ state, onSelectUsta, onRetry }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  if (state.loading) return <SectionLoader height={176} />;
  if (state.error) return <SectionError onRetry={onRetry} />;

  const workers = state.data ?? [];
  if (workers.length === 0) {
    return (
      <EmptyCard
        style={{ marginHorizontal: 0 }}
        icon={<MaterialCommunityIcons name="account-search-outline" size={22} color={t.muted} />}
        title={tr('zakazchiMain.workersEmpty')}
      />
    );
  }

  return (
    <>
      {workers.map((u, i) => (
        <TouchableOpacity
          key={u.id}
          style={[
            s.masterCard,
            {
              backgroundColor: t.card,
              borderColor: t.border,
              marginBottom: i < workers.length - 1 ? 11 : 0,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectUsta(u)}
          accessibilityRole="button"
          accessibilityLabel={u.name}
        >
          <View style={{ marginRight: 13 }}>
            <Avatar letter={u.initial} size={48} bgColor={u.color} />
            {i === 0 && (
              <View style={s.rankBadge}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#3a2a08' }}>#1</Text>
              </View>
            )}
            {u.is_online && <View style={[s.onlineDot, { borderColor: t.card }]} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 14.5, color: t.text }}>{u.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: t.muted, flexShrink: 1 }} numberOfLines={1}>
                {u.profession || tr('zakazchiMain.defaultProfession')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <MaterialCommunityIcons name="shield-check" size={11} color={t.green} />
                <Text style={{ fontSize: 11.5, color: t.green }} numberOfLines={1}>
                  {u.location}
                </Text>
              </View>
            </View>
          </View>
          <View style={s.ratingBadge}>
            <Ionicons name="star" size={12} color={t.gold} />
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: t.gold, marginLeft: 3 }}>
              {u.rating.toFixed(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}

const s = StyleSheet.create({
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  rankBadge: {
    position: 'absolute',
    top: -7,
    left: -7,
    backgroundColor: '#f5c451',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,196,81,0.13)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
