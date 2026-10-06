import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import MockBadge from '../../orders/components/MockBadge';

// Ish sarlavhasi va kategoriya / joylashuv / qachon bajarilgani qatori.
export default function WorkMeta({ title, category, location, postedAgo, mock }) {
  const { theme: t } = useTheme();

  return (
    <>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      <View style={styles.row}>
        <View style={[styles.chip, { backgroundColor: t.orange + '18' }]}>
          <Text style={[styles.chipText, { color: t.orange }]}>{category}</Text>
        </View>
        <View style={styles.item}>
          <Feather name="map-pin" size={13} color={t.muted} />
          <Text style={[styles.itemText, { color: t.muted }]}>{location}</Text>
        </View>
        <View style={styles.item}>
          <Feather name="calendar" size={13} color={t.muted} />
          <Text style={[styles.itemText, { color: t.muted }]}>{postedAgo}</Text>
        </View>
        {mock && <MockBadge />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', lineHeight: 27 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipText: { fontSize: 11.5, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemText: { fontSize: 12, fontWeight: '600' },
});
