import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import { CATEGORY_ACCENT } from '../constants';
import CategoryGlyph from './CategoryGlyph';

const INK = '#1c1917';

// Yo'nalish "afishasi": backend bergan pastel rangdagi katta karta, ulkan emoji, nom va ustalar soni.
// `onAll` berilsa — pastda "Barchasi" tugmasi (shu yo'nalishning barcha ustalari).
export default function CategoryBanner({ category, count, onBack, onAll }) {
  const { t: tr } = useLanguage();
  const bg = category?.color ?? CATEGORY_ACCENT;

  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <View style={s.emojiWrap} pointerEvents="none">
        <CategoryGlyph glyph={category?.glyph} color={INK} size={120} />
      </View>

      <TouchableOpacity onPress={onBack} activeOpacity={0.8} style={s.back}>
        <Feather name="chevron-left" size={20} color={INK} />
      </TouchableOpacity>

      <Text style={s.title} numberOfLines={3}>
        {category?.label}
      </Text>
      <Text style={s.subtitle}>{tr('xizmatlar.detail.activeInDirection', { count })}</Text>

      {onAll && (
        <TouchableOpacity onPress={onAll} activeOpacity={0.85} style={s.allBtn}>
          <Text style={s.allTxt}>{tr('xizmatlar.browse.allInDirection')}</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 28, padding: 18, minHeight: 180, overflow: 'hidden', position: 'relative' },
  emojiWrap: {
    position: 'absolute',
    right: -10,
    bottom: -18,
    opacity: 0.92,
    transform: [{ rotate: '-12deg' }],
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: INK, fontSize: 27, fontWeight: '900', marginTop: 22, maxWidth: '68%' },
  subtitle: {
    color: 'rgba(28,25,23,0.66)',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 4,
    maxWidth: '68%',
  },
  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: INK,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  allTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
