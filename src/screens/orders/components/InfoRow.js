import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

export default function InfoRow({ icon, label, value, t, right }) {
  return (
    <View style={s.row}>
      <View style={s.left}>
        <Feather name={icon} size={14} color={t.muted} />
        <Text style={[s.label, { color: t.muted }]}>{label}</Text>
      </View>
      {right || <Text style={[s.value, { color: t.text }]}>{value}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12.5, fontWeight: '600' },
  value: { fontSize: 12.5, fontWeight: '700' },
});
