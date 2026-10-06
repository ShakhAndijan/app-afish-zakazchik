import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SummaryRow({ icon, label, value, t }) {
  return (
    <View style={s.summaryRow}>
      <View style={s.summaryLabelWrap}>
        <MaterialCommunityIcons name={icon} size={15} color={t.muted} />
        <Text style={[s.summaryLabel, { color: t.muted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[s.summaryValue, { color: t.text }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  summaryLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    width: '38%',
  },
  summaryLabel: { fontSize: 12.5, flexShrink: 1 },
  summaryValue: { fontSize: 13.5, fontWeight: '600', flex: 1, textAlign: 'right' },
});
