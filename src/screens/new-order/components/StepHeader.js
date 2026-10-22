import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

// Forma bo'limi sarlavhasi: raqam + nom (saytdagi 1 / 2 / 3 bosqichlar bilan bir xil tartib).
export default function StepHeader({ no, title }) {
  const { theme: t } = useTheme();

  return (
    <View style={s.row}>
      <View style={[s.badge, { backgroundColor: t.orange }]}>
        <Text style={s.badgeTxt}>{no}</Text>
      </View>
      <Text style={[s.title, { color: t.text }]}>{title}</Text>
      <View style={[s.line, { backgroundColor: t.border }]} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26 },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '800' },
  line: { flex: 1, height: 1 },
});
