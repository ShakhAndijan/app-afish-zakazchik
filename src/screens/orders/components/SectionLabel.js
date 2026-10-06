import { View, Text, StyleSheet } from 'react-native';
import MockBadge from './MockBadge';

// Bo'lim sarlavhasi. `mock` bo'lsa, o'ng tomonda "Namuna ma'lumot" belgisi chiqadi.
export default function SectionLabel({ children, mock, t }) {
  return (
    <View style={s.row}>
      <Text style={[s.label, { color: t.text }]}>{children}</Text>
      {mock && <MockBadge />}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 22,
    marginBottom: 12,
  },
  label: { flexShrink: 1, fontSize: 14.5, fontWeight: '800' },
});
