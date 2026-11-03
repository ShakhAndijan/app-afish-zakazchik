import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getContestWinners } from '../../../api/workers';
import Avatar from '../../../components/Avatar';
import SectionHeader from './SectionHeader';

const CARD_W = 168;

// "Tumanning eng yaxshi ustalari": o'tgan oy tanlovi g'oliblari. Ma'lumot yo'q bo'lsa bo'lim ko'rinmaydi.
export default function ChampionsSection({ onSelectUsta, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { data } = useQuery({
    queryKey: ['contest', 'winners'],
    queryFn: () => getContestWinners({ limit: 12 }),
    staleTime: 30 * 60 * 1000,
  });

  const winners = data?.winners ?? [];
  if (winners.length === 0) return null;

  return (
    <View style={style}>
      <SectionHeader
        title={tr('homeBlocks.championsTitle')}
        actionLabel={
          data.period ? tr('homeBlocks.championsPeriod', { period: data.period }) : undefined
        }
        style={{ paddingHorizontal: 20, marginBottom: 12 }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {winners.map((w) => (
          <TouchableOpacity
            key={`${w.worker.id}-${w.district}`}
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
            activeOpacity={0.85}
            accessibilityRole="button"
            onPress={() => onSelectUsta?.(w.worker)}
          >
            <View style={s.trophy}>
              <MaterialCommunityIcons name="trophy" size={16} color="#f5c451" />
            </View>
            <Avatar
              letter={w.worker.initial}
              size={52}
              bgColor={w.worker.color}
              uri={w.worker.profile_photo}
            />
            <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
              {w.worker.name}
            </Text>
            <Text style={[s.place, { color: t.muted }]} numberOfLines={1}>
              {[w.district, w.region].filter(Boolean).join(', ')}
            </Text>
            <View style={s.stats}>
              {w.rating != null && (
                <View style={s.stat}>
                  <Ionicons name="star" size={12} color={t.gold} />
                  <Text style={[s.statTxt, { color: t.gold }]}>{w.rating.toFixed(1)}</Text>
                </View>
              )}
              <Text style={[s.statTxt, { color: t.muted }]}>
                {tr('homeBlocks.championsStats', { jobs: w.jobs })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 20, gap: 12 },
  card: {
    width: CARD_W,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  trophy: { position: 'absolute', top: 10, right: 10 },
  name: { fontSize: 14, fontWeight: '800', marginTop: 6, maxWidth: '100%' },
  place: { fontSize: 11.5, maxWidth: '100%' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statTxt: { fontSize: 11.5, fontWeight: '700' },
});
