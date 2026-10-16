import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CategoryGlyph from './CategoryGlyph';

const INK = '#1c1917';

// Mavsumiy yo'nalishlar: gorizontal surilanadigan pastel tabletkalar (emoji + nom).
export default function SeasonalRail({ items, onPress }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.scroll}
      contentContainerStyle={s.content}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onPress(item.id)}
          activeOpacity={0.85}
          style={[s.pill, { backgroundColor: item.color }]}
        >
          <CategoryGlyph glyph={item.glyph} color={INK} size={18} />
          <Text style={s.txt} numberOfLines={1}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // Ekran chetigacha chiqib turadi (ota konteynerning gorizontal bo'sh joyi 16).
  scroll: { marginHorizontal: -16, flexGrow: 0 },
  content: { paddingHorizontal: 16, gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  txt: { color: INK, fontSize: 13, fontWeight: '800', maxWidth: 170 },
});
