import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

export default function StatTile({ icon, iconColor, iconBg, value, label, t }) {
  return (
    <View style={[s.tile, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[s.icon, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={15} color={iconColor} />
      </View>
      <Text style={[s.value, { color: t.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[s.label, { color: t.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 14.5, fontWeight: '800' },
  label: { fontSize: 10.5, fontWeight: '600' },
});
