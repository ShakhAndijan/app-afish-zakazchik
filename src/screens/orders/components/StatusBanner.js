import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

// Buyurtma holati banneri: ikonka, holat nomi va izoh. `meta` — STATUS_META dagi yozuv.
export default function StatusBanner({ meta, label, subtext }) {
  const { theme: t } = useTheme();

  return (
    <View style={[s.banner, { backgroundColor: meta.bg, borderColor: meta.color + '33' }]}>
      <View style={[s.icon, { backgroundColor: meta.color + '22' }]}>
        <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.label, { color: meta.color }]}>{label}</Text>
        <Text style={[s.sub, { color: t.muted }]}>{subtext}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14.5, fontWeight: '800' },
  sub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
