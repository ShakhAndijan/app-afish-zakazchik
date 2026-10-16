import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import CategoryGlyph from './CategoryGlyph';

const INK = '#1c1917';
const GAP = 12;
// Ikki ustun, kartalar balandligi navbat bilan o'zgaradi (baland-past-past-baland): g'isht terish ko'rinishi.
const TALL = 176;
const SHORT = 132;
const heightAt = (i) => (i % 4 === 0 || i % 4 === 3 ? TALL : SHORT);

function Card({ item, height, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[s.card, { height, backgroundColor: item.color }]}
    >
      <View style={s.emoji} pointerEvents="none">
        <CategoryGlyph glyph={item.glyph} color={INK} size={height > SHORT ? 76 : 62} />
      </View>
      <View style={s.arrow}>
        <Feather name="arrow-up-right" size={15} color={INK} />
      </View>
      <View style={{ flex: 1 }} />
      <Text style={s.name} numberOfLines={3}>
        {item.label}
      </Text>
      {item.count > 0 && (
        <View style={s.pill}>
          <Feather name="users" size={11} color={INK} />
          <Text style={s.pillTxt}>{item.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Yo'nalishlar to'ri: backend pastel ranglarida, har xil balandlikdagi katta kartalar.
export default function BentoGrid({ items, onPress }) {
  const columns = [0, 1].map((col) =>
    items.map((item, i) => ({ item, i })).filter(({ i }) => i % 2 === col)
  );

  return (
    <View style={s.cols}>
      {columns.map((column, idx) => (
        <View key={idx} style={s.col}>
          {column.map(({ item, i }) => (
            <Card key={item.id} item={item} height={heightAt(i)} onPress={() => onPress(item.id)} />
          ))}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  cols: { flexDirection: 'row', gap: GAP },
  col: { flex: 1, gap: GAP },
  card: { borderRadius: 26, padding: 14, overflow: 'hidden' },
  emoji: {
    position: 'absolute',
    right: -8,
    top: 22,
    transform: [{ rotate: '12deg' }],
    opacity: 0.95,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: INK, fontSize: 15, fontWeight: '800', lineHeight: 19 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  pillTxt: { color: INK, fontSize: 11, fontWeight: '800' },
});
