import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { STATUS_META, statusLabel } from '../constants';

export default function StatusPill({ order }) {
  const { t: tr } = useLanguage();
  const cfg = STATUS_META[order.status] || STATUS_META.active;

  return (
    <View style={[s.pill, { backgroundColor: cfg.bg }]}>
      <MaterialCommunityIcons name={cfg.icon} size={11} color={cfg.color} />
      <Text style={[s.text, { color: cfg.color }]}>{statusLabel(tr, order)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
  },
  text: { fontSize: 11, fontWeight: '700' },
});
