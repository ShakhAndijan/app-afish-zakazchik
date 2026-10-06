import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import SectionLabel from '../../orders/components/SectionLabel';
import { formatPrice } from '../utils';

function Row({ icon, label, value }) {
  const { theme: t } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Feather name={icon} size={14} color={t.muted} />
        <Text style={[styles.rowLabel, { color: t.muted }]}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, { color: t.text }]}>{value}</Text>
    </View>
  );
}

// "Narx va davomiylik" bo'limi: umumiy narx, (namuna bo'lsa) materiallar va ish haqi bo'linishi, davomiylik.
// `mock` — bo'lim belgisi; `showSplit` — bo'linish faqat narx namuna bo'lganda ko'rsatiladi.
export default function PriceSection({ details, mock, showSplit }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const som = tr('common.currencySom');

  return (
    <>
      <SectionLabel mock={mock} t={t}>
        {tr('workDetail.priceTitle')}
      </SectionLabel>
      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.totalLabel, { color: t.muted }]}>{tr('workDetail.totalPrice')}</Text>
          <Text style={[styles.totalValue, { color: t.text }]}>
            {formatPrice(details.price)} {som}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: t.border }]} />
        {showSplit && (
          <>
            <Row icon="package" label={tr('workDetail.materials')} value={`${formatPrice(details.priceMaterial)} ${som}`} />
            <Row icon="tool" label={tr('workDetail.laborCost')} value={`${formatPrice(details.priceLabor)} ${som}`} />
          </>
        )}
        <Row icon="clock" label={tr('workDetail.duration')} value={details.duration} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 12.5, fontWeight: '600' },
  totalValue: { fontSize: 17, fontWeight: '800' },
  divider: { height: 1, marginVertical: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowLabel: { fontSize: 12.5, fontWeight: '600' },
  rowValue: { fontSize: 12.5, fontWeight: '700' },
});
