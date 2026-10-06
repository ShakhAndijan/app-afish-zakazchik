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

// Ish narxi. Umumiy narx va soatlik tarif backenddan; materiallar / ish haqi
// bo'linishi (`split`) hozircha mock — backend uni bermaydi.
export default function PriceCard({ order, split, t }) {
  const { t: tr } = useLanguage();
  const som = tr('common.currencySom');
  const money = (n) => `${formatNumber(Math.round(n))} ${som}`;
  const showHourly = order.priceMode === 'hourly' && order.hourlyRate != null;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={s.headerRow}>
        <Text style={[s.totalLabel, { color: t.muted }]}>
          {tr(TOTAL_LABEL_KEY[order.priceKind] || TOTAL_LABEL_KEY.agreed)}
        </Text>
        <Text style={[s.totalValue, { color: t.text }]}>
          {order.price != null ? money(order.price) : tr('orders.priceTbd')}
        </Text>
      </View>

      {showHourly && (
        <>
          <View style={[s.divider, { backgroundColor: t.border }]} />
          <InfoRow icon="clock" label={tr('orderDetail.hourlyRate')} value={money(order.hourlyRate)} t={t} />
          {order.estimatedHours != null && (
            <InfoRow
              icon="watch"
              label={tr('orderDetail.estimatedHours')}
              value={tr('orderDetail.hours', { n: formatHours(order.estimatedHours) })}
              t={t}
            />
          )}
        </>
      )}

      {split.material != null && (
        <>
          <View style={[s.divider, { backgroundColor: t.border }]} />
          <InfoRow icon="package" label={tr('orderDetail.materials')} value={money(split.material)} t={t} />
          <InfoRow icon="tool" label={tr('orderDetail.labor')} value={money(split.labor)} t={t} />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 12.5, fontWeight: '600' },
  totalValue: { fontSize: 17, fontWeight: '800' },
  divider: { height: 1, marginVertical: 10 },
});
