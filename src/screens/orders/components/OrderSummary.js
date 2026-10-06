import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatOrderDate, formatHours } from '../utils';

// Buyurtma sarlavhasi: nom, raqam, xizmat turi, manzil, sana va taxminiy davomiylik.
export default function OrderSummary({ order, title }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      <Text style={[s.title, { color: t.text }]}>{title}</Text>
      <Text style={[s.number, { color: t.muted }]}>{tr('orderDetail.orderNumber', { id: order.id })}</Text>

      {(!!order.service || !!order.address) && (
        <View style={s.metaRow}>
          {!!order.service && (
            <View style={[s.chip, { backgroundColor: t.orange + '18' }]}>
              <Text style={[s.chipText, { color: t.orange }]}>{order.service}</Text>
            </View>
          )}
          {!!order.address && (
            <View style={s.metaItem}>
              <Feather name="map-pin" size={13} color={t.muted} />
              <Text style={[s.metaItemText, { color: t.muted }]} numberOfLines={1}>
                {order.address}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={[s.metaRow, { marginTop: 8 }]}>
        <View style={s.metaItem}>
          <Feather name="calendar" size={13} color={t.muted} />
          <Text style={[s.metaItemText, { color: t.muted }]}>{formatOrderDate(order.createdAt, tr)}</Text>
        </View>
        {order.estimatedHours != null && (
          <View style={s.metaItem}>
            <Feather name="clock" size={13} color={t.muted} />
            <Text style={[s.metaItemText, { color: t.muted }]}>
              {tr('orderDetail.hours', { n: formatHours(order.estimatedHours) })}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', lineHeight: 27, marginTop: 20 },
  number: { fontSize: 12.5, fontWeight: '600', marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipText: { fontSize: 11.5, fontWeight: '700' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaItemText: { fontSize: 12, fontWeight: '600' },
});
