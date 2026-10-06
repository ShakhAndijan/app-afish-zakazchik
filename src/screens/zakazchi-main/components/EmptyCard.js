import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

// Ro'yxat bo'sh bo'lganda ko'rsatiladigan karta. `icon` — tayyor ikonka elementi,
// `children` — pastdagi ixtiyoriy tugma.
export default function EmptyCard({ icon, title, subtitle, children, style }) {
  const { theme: t } = useTheme();

  return (
    <View style={[s.box, { borderColor: t.border, backgroundColor: t.card }, style]}>
      {icon}
      <Text style={[s.title, { color: t.muted }]}>{title}</Text>
      {!!subtitle && <Text style={[s.subtitle, { color: t.faint }]}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    marginHorizontal: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  title: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: 12, textAlign: 'center', lineHeight: 17, marginTop: -2 },
});
