import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import CategoryGlyph from '../components/CategoryGlyph';
import EmptyBox from '../components/EmptyBox';
import useTabBarSpace from '../../../navigation/useTabBarSpace';

const INK = '#1c1917';

// Asosiy yo'nalish ichidagi quyi yo'nalishlar: tepada katta belgi bilan sarlavha va "Barchasi"
// tugmasi, pastda "stories" uslubidagi dumaloq belgilar (uch ustun, nomi tagida).
// Qidiruv matni quyi yo'nalishlar nomi bo'yicha filtrlaydi.
export default function SubCategoryView({
  searchRow,
  parent,
  query,
  onBack,
  onOpenCategory,
  onOpenAll,
}) {
  const bottomSpace = useTabBarSpace(90);
  const { t: tr } = useLanguage();
  const { t, styles } = useXizmatlarStyles();

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const children = parent?.children ?? [];
    return q ? children.filter((c) => c.label.toLowerCase().includes(q)) : children;
  }, [parent, query]);

  return (
    <>
      {searchRow}

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={s.topRow}>
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.8}
              style={[s.back, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Feather name="chevron-left" size={20} color={t.text} />
            </TouchableOpacity>
            {parent && (
              <TouchableOpacity
                onPress={() => onOpenAll(parent.id)}
                activeOpacity={0.85}
                style={[s.allBtn, { borderColor: t.orange }]}
              >
                <Text style={[s.allTxt, { color: t.orange }]}>
                  {tr('xizmatlar.browse.allInDirection')}
                </Text>
                <Feather name="arrow-right" size={15} color={t.orange} />
              </TouchableOpacity>
            )}
          </View>

          <View style={s.titleRow}>
            <View style={[s.bigGlyph, { backgroundColor: parent?.color }]}>
              <CategoryGlyph glyph={parent?.glyph} color={INK} size={40} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.title, { color: t.text }]} numberOfLines={3}>
                {parent?.label}
              </Text>
              <Text style={[s.sub, { color: t.muted }]}>
                {tr('xizmatlar.detail.activeInDirection', { count: parent?.count ?? 0 })}
              </Text>
            </View>
          </View>

          {items.length > 0 ? (
            <View style={s.grid}>
              {items.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => onOpenCategory(c.id)}
                  activeOpacity={0.8}
                  style={s.item}
                >
                  <View style={[s.circle, { backgroundColor: c.color, borderColor: t.card }]}>
                    <CategoryGlyph glyph={c.glyph} color={INK} size={32} />
                    {c.count > 0 && (
                      <View style={[s.badge, { backgroundColor: t.orange, borderColor: t.bg }]}>
                        <Text style={s.badgeTxt}>{c.count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.name, { color: t.text }]} numberOfLines={2}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyBox style={{ marginTop: 16 }} text={tr('xizmatlar.browse.noDirectionsFound')} />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const CIRCLE = 78;

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  allTxt: { fontSize: 13, fontWeight: '800' },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 26,
  },
  bigGlyph: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  title: { fontSize: 23, fontWeight: '900', lineHeight: 28 },
  sub: { fontSize: 12.5, fontWeight: '600', marginTop: 4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 22 },
  item: { width: '33.333%', alignItems: 'center', paddingHorizontal: 4 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  name: { fontSize: 12.5, fontWeight: '700', textAlign: 'center', marginTop: 9, lineHeight: 16 },
});
