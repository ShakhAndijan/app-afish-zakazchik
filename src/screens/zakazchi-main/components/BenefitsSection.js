import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';
import MockBadge from '../../orders/components/MockBadge';
import SectionHeader from './SectionHeader';

const BENEFITS = [
  { icon: 'shield-check', color: '#2ecc71', key: 'guaranteed' },
  { icon: 'check-decagram', color: '#3b82f6', key: 'verified' },
  { icon: 'lightning-bolt', color: '#f5b81f', key: 'fast' },
];

// Matn raqamli bo'lishi uchun /system/stats ma'lumotidan foydalanadi. Ma'lumot kelmasa
// (yoki raqam 0 bo'lsa) — oddiy statik matn ko'rsatiladi.
function describe(key, stats, tr) {
  if (key === 'guaranteed' && stats?.order_count > 0) {
    const rating = Number(stats.average_rating);
    const orders = formatNumber(stats.order_count);
    return stats.average_rating != null && Number.isFinite(rating)
      ? tr('homeExtra.guaranteedStats', { orders, rating: rating.toFixed(1) })
      : tr('homeExtra.guaranteedOrders', { orders });
  }
  if (key === 'verified' && stats?.verified_worker_count > 0) {
    return tr('homeExtra.verifiedStats', { n: formatNumber(stats.verified_worker_count) });
  }
  return tr(`app.benefits.${key}Desc`);
}

// "Nega AFISH?" bo'limi (yangi mijozlar uchun). Kartalar haqiqiy statistikaga bog'langan:
//  - "Kafolatlangan ish" bosilsa — yordam ekrani (`onOpenGuarantee`),
//  - "Tekshirilgan ustalar" bosilsa — faqat tasdiqlangan ustalar filtri (`onOpenVerified`).
// "Tezkor javob" uchun backendda umumiy ko'rsatkich yo'q, shuning uchun namunaviy belgi bilan.
export default function BenefitsSection({ stats, onOpenGuarantee, onOpenVerified }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const onPress = { guaranteed: onOpenGuarantee, verified: onOpenVerified };

  return (
    <>
      <SectionHeader title={tr('app.sectionHead.whyAfish')} />
      <View style={{ gap: 12 }}>
        {BENEFITS.map((b) => {
          const press = onPress[b.key];
          return (
            <TouchableOpacity
              key={b.key}
              disabled={!press}
              onPress={press}
              activeOpacity={0.85}
              style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <View style={[s.icon, { backgroundColor: b.color + '22' }]}>
                <MaterialCommunityIcons name={b.icon} size={22} color={b.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.titleRow}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: t.text, flexShrink: 1 }}>
                    {tr(`app.benefits.${b.key}Title`)}
                  </Text>
                  {b.key === 'fast' && <MockBadge />}
                </View>
                <Text style={{ fontSize: 12.5, color: t.muted, lineHeight: 18, marginTop: 3 }}>
                  {describe(b.key, stats, tr)}
                </Text>
              </View>
              {!!press && <MaterialCommunityIcons name="chevron-right" size={20} color={t.faint} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
