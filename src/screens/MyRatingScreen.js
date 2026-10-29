import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import { getCustomerMe } from '../api/user';
import { getBadgeLevels, getCustomerReviews } from '../api/account';
import useBottomInset from '../hooks/useBottomInset';

const LEVELS = ['bronze', 'silver', 'gold'];
const LEVEL_COLOR = { bronze: '#c8803c', silver: '#9aa5b1', gold: '#e8a91b' };
const EMPTY = [];

const dateLabel = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
};

// Mijoz statusi (Bronza/Kumush/Oltin — avtomatik beriladi, ustalar buyurtmalarda ko'radi) va
// ustalar bergan baholar. Saytdagi "Hisob" sahifasidagi status kartasi va "Как вас оценили специалисты" bloki.
export default function MyRatingScreen({ onBack }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const me = useQuery({
    queryKey: ['customer', 'me'],
    queryFn: getCustomerMe,
    staleTime: 30 * 1000,
  });
  const levels = useQuery({
    queryKey: ['badge', 'levels'],
    queryFn: getBadgeLevels,
    staleTime: 60 * 60 * 1000,
  });
  const customerId = me.data?.id ?? null;
  const reviews = useQuery({
    queryKey: ['customer', 'reviews', customerId],
    queryFn: () => getCustomerReviews(customerId),
    enabled: customerId != null,
    staleTime: 30 * 1000,
  });

  const badge = me.data?.reliability_badge ?? 'none';
  const rating = me.data?.overall_rating != null ? Number(me.data.overall_rating) : null;
  const rules = levels.data?.customer ?? null;
  const list = reviews.data ?? EMPTY;

  const ruleText = (r) =>
    [
      tr('account.rule.orders', { n: r.min_orders }),
      r.max_cancel_pct < 100 ? tr('account.rule.cancel', { pct: r.max_cancel_pct }) : null,
      r.min_rating > 0 ? tr('account.rule.rating', { rating: r.min_rating.toFixed(1) }) : null,
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: t.text }]}>{tr('account.ratingTitle')}</Text>
      </View>

      {me.isPending ? (
        <View style={s.center}>
          <AppLoader size={160} />
        </View>
      ) : me.isError ? (
        <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={me.refetch} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32 + bottomInset,
            gap: 14,
          }}
        >
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={s.cardHead}>
              <Text style={[s.cardTitle, { color: t.text }]}>{tr('account.statusTitle')}</Text>
              {badge === 'none' ? (
                <Text style={[s.none, { color: t.muted }]}>{tr('account.statusNone')}</Text>
              ) : (
                <Pill color={LEVEL_COLOR[badge]} label={tr(`account.level.${badge}`)} />
              )}
            </View>
            <Text style={[s.lead, { color: t.muted }]}>{tr('account.statusLead')}</Text>
            {rules && (
              <View style={{ gap: 8, marginTop: 4 }}>
                {LEVELS.map((lvl) => (
                  <View
                    key={lvl}
                    style={[
                      s.levelRow,
                      {
                        borderColor: lvl === badge ? LEVEL_COLOR[lvl] : t.border,
                        backgroundColor: lvl === badge ? LEVEL_COLOR[lvl] + '1f' : 'transparent',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="shield-star" size={22} color={LEVEL_COLOR[lvl]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.levelName, { color: t.text }]}>
                        {tr(`account.level.${lvl}`)}
                      </Text>
                      <Text style={[s.levelRule, { color: t.muted }]}>{ruleText(rules[lvl])}</Text>
                    </View>
                    {lvl === badge && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={LEVEL_COLOR[lvl]}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[s.cardTitle, { color: t.text }]}>{tr('account.reviewsTitle')}</Text>
            <Text style={[s.lead, { color: t.muted }]}>{tr('account.reviewsHint')}</Text>
            {rating != null && rating > 0 ? (
              <View style={s.ratingRow}>
                <Text style={[s.ratingBig, { color: t.text }]}>{rating.toFixed(1)}</Text>
                <Stars value={rating} size={20} color={t.gold} empty={t.faint} />
              </View>
            ) : (
              <View style={s.ratingRow}>
                <MaterialCommunityIcons name="star-outline" size={20} color={t.faint} />
                <Text style={[s.none, { color: t.faint }]}>{tr('account.noRatingYet')}</Text>
              </View>
            )}

            {reviews.isPending && customerId != null ? (
              <View style={{ paddingVertical: 20 }}>
                <AppLoader size={90} />
              </View>
            ) : list.length === 0 ? (
              <Text style={[s.empty, { color: t.muted }]}>
                {rating != null && rating > 0
                  ? tr('account.reviewsNoComments')
                  : tr('account.reviewsEmpty')}
              </Text>
            ) : (
              <View style={{ gap: 10, marginTop: 14 }}>
                {list.map((r) => (
                  <View key={r.id} style={[s.review, { borderColor: t.border }]}>
                    <View style={s.reviewHead}>
                      <Stars value={r.rating} size={14} color={t.gold} empty={t.faint} />
                      <Text style={[s.reviewDate, { color: t.faint }]}>
                        {dateLabel(r.createdAt)}
                      </Text>
                    </View>
                    {!!r.comment && (
                      <Text style={[s.reviewText, { color: t.text }]}>{r.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Pill({ color, label }) {
  return (
    <View style={[s.pill, { backgroundColor: color + '26' }]}>
      <MaterialCommunityIcons name="shield-star" size={14} color={color} />
      <Text style={[s.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function Stars({ value, size, color, empty }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i}
          name={value >= i - 0.25 ? 'star' : value >= i - 0.75 ? 'star-half-full' : 'star-outline'}
          size={size}
          color={value >= i - 0.75 ? color : empty}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 20 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  lead: { fontSize: 12.5, lineHeight: 18 },
  none: { fontSize: 13, fontWeight: '600' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: { fontSize: 12.5, fontWeight: '800' },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  levelName: { fontSize: 14, fontWeight: '800' },
  levelRule: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  ratingBig: { fontSize: 34, fontWeight: '800' },
  empty: { fontSize: 13, marginTop: 10, lineHeight: 19 },
  review: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 },
  reviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewDate: { fontSize: 12 },
  reviewText: { fontSize: 13.5, lineHeight: 19 },
});
