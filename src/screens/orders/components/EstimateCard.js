import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';
import { formatHours } from '../utils';

// Smeta qatorlari: nomi, miqdor × narx va jami (miqdor bo'lmasa narxning o'zi).
export function estimateTotal(rows) {
  return rows.reduce((sum, r) => sum + (r.price ?? 0) * (r.qty ?? 1), 0);
}

export default function EstimateCard({ rows, t }) {
  const { t: tr } = useLanguage();
  const som = tr('common.currencySom');
  const money = (n) => `${formatNumber(Math.round(n))} ${som}`;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {rows.map((row, i) => {
        const line = (row.price ?? 0) * (row.qty ?? 1);
        return (
          <View key={i} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: t.border }]}>
            <View style={s.left}>
              <Text style={[s.name, { color: t.text }]}>{row.name}</Text>
              {row.qty != null && row.price != null && (
                <Text style={[s.sub, { color: t.muted }]}>
                  {formatHours(row.qty)}
                  {row.unit ? ` ${row.unit}` : ''} × {money(row.price)}
                </Text>
              )}
            </View>
            {row.price != null && <Text style={[s.sum, { color: t.text }]}>{money(line)}</Text>}
          </View>
        );
      })}
      <View style={[s.row, s.total, { borderTopColor: t.border }]}>
        <Text style={[s.name, { color: t.text }]}>{tr('orderDetail.estimateTotal')}</Text>
        <Text style={[s.sum, { color: t.orange }]}>{money(estimateTotal(rows))}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  left: { flex: 1 },
  name: { fontSize: 13.5, fontWeight: '700' },
  sub: { fontSize: 12, marginTop: 2 },
  sum: { fontSize: 13.5, fontWeight: '800' },
  total: { borderTopWidth: 1, justifyContent: 'space-between' },
});
