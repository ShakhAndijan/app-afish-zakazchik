import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useXizmatlarStyles } from '../styles';
import CategoryGlyph from './CategoryGlyph';

// Yo'nalish qatori: pastel doira ichida emoji, nom (ixtiyoriy `hint` — ota yo'nalish), ustalar soni.
export default function CategoryRow({ item, hint, onPress }) {
  const { t } = useXizmatlarStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}
    >
      <View style={[s.glyph, { backgroundColor: item.color }]}>
        <CategoryGlyph glyph={item.glyph} color="#1c1917" size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.name, { color: t.text }]} numberOfLines={2}>
          {item.label}
        </Text>
        {hint ? (
          <Text style={[s.hint, { color: t.muted }]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
      {item.count > 0 && (
        <View style={s.count}>
          <Feather name="users" size={11} color={t.orange} />
          <Text style={[s.countTxt, { color: t.orange }]}>{item.count}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color={t.faint} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    paddingRight: 14,
  },
  glyph: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 14.5, fontWeight: '700' },
  hint: { fontSize: 11.5, marginTop: 2 },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232,122,69,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countTxt: { fontSize: 11.5, fontWeight: '800' },
});
