import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

const INK = '#1c1917';
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function CategorySection({
  selectedCategories,
  toggleCategory,
  setCategoryPickerOpen,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const open = () => setCategoryPickerOpen(true);

  return (
    <>
      {/* ── Xizmat turi (ko'p tanlovli) ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.categoryLabel')}</Text>

      {selectedCategories.length === 0 ? (
        <TouchableOpacity
          onPress={open}
          activeOpacity={0.85}
          style={[s.empty, { borderColor: t.orange, backgroundColor: t.card }]}
        >
          <View style={[s.emptyIcon, { backgroundColor: 'rgba(232,122,69,0.14)' }]}>
            <MaterialCommunityIcons name="shape-plus-outline" size={26} color={t.orange} />
          </View>
          <Text style={[s.emptyTxt, { color: t.text }]}>{tr('newOrder.categoryAddBtn')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={t.orange} />
        </TouchableOpacity>
      ) : (
        <View style={common.chipRow}>
          {selectedCategories.map((c) => (
            <View
              key={c.id}
              style={[s.pill, { backgroundColor: HEX.test(c.color ?? '') ? c.color : '#fde4d3' }]}
            >
              {c.icon ? <Text style={s.pillEmoji}>{c.icon}</Text> : null}
              <Text style={s.pillTxt} numberOfLines={1}>
                {c.name}
              </Text>
              <TouchableOpacity
                onPress={() => toggleCategory(c.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={s.pillClose}
              >
                <MaterialCommunityIcons name="close" size={12} color={INK} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={open}
            activeOpacity={0.8}
            style={[s.more, { backgroundColor: t.orange }]}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
            <Text style={s.moreTxt}>{tr('newOrder.categoryAddMore')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 14,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxt: { flex: 1, fontSize: 15, fontWeight: '700' },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    maxWidth: '100%',
  },
  pillEmoji: { fontSize: 17 },
  pillTxt: { color: INK, fontSize: 13.5, fontWeight: '800', flexShrink: 1 },
  pillClose: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  moreTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
