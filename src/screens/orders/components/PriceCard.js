import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';
import InfoRow from './InfoRow';
import { formatHours } from '../utils';

const TOTAL_LABEL_KEY = {
  agreed: 'orderDetail.totalPrice',
  budget: 'orderDetail.priceBudget',
  estimate: 'orderDetail.priceEstimate',
};

// Ish narxi: yirik umumiy summa. Umumiy narx va soatlik tarif backenddan; materiallar / ish haqi
// bo'linishi (`split`) hozircha mock — backend uni bermaydi.
export default function PriceCard({ order, split, t }) {
  const { t: tr } = useLanguage();
  const som = tr('common.currencySom');
  const money = (n) => `${formatNumber(Math.round(n))} ${som}`;
  const showHourly = order.priceMode === 'hourly' && order.hourlyRate != null;
  const agreed = order.priceKind === 'agreed';

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[s.hero, { backgroundColor: (agreed ? t.green : t.orange) + '16' }]}>
        <Text style={[s.totalLabel, { color: t.muted }]}>
          {tr(TOTAL_LABEL_KEY[order.priceKind] || TOTAL_LABEL_KEY.agreed)}
        </Text>
        <Text style={[s.totalValue, { color: order.price != null ? t.text : t.muted }]}>
          {order.price != null ? money(order.price) : tr('orders.priceTbd')}
        </Text>
      </View>

      {showHourly && (
        <View style={s.rows}>
          <InfoRow
            icon="clock"
            label={tr('orderDetail.hourlyRate')}
            value={money(order.hourlyRate)}
            t={t}
          />
          {order.estimatedHours != null && (
            <InfoRow
              icon="watch"
              label={tr('orderDetail.estimatedHours')}
              value={tr('orderDetail.hours', { n: formatHours(order.estimatedHours) })}
              t={t}
            />
          )}
        </View>
      )}

      {split.material != null && (
        <View style={s.rows}>
          <InfoRow
            icon="package"
            label={tr('orderDetail.materials')}
            value={money(split.material)}
            t={t}
          />
          <InfoRow icon="tool" label={tr('orderDetail.labor')} value={money(split.labor)} t={t} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 12 },
  hero: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14 },
  totalLabel: { fontSize: 12, fontWeight: '600' },
  totalValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, marginTop: 3 },
  rows: { paddingHorizontal: 4, paddingTop: 8 },
});
