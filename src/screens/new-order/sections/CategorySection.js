import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';

export default function CategorySection({ selectedCategories, toggleCategory, setCategoryPickerOpen }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Xizmat turi (ko'p tanlovli) ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.categoryLabel')}</Text>
      <View style={common.chipRow}>
        {selectedCategories.map((c) => (
          <View key={c.id} style={[s.selectedChip, { backgroundColor: t.orange }]}>
            <Text style={s.selectedChipTxt} numberOfLines={1}>
              {c.name}
            </Text>
            <TouchableOpacity
              onPress={() => toggleCategory(c.id)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={() => setCategoryPickerOpen(true)}
          activeOpacity={0.8}
          style={[common.addChip, { borderColor: t.orange }]}
        >
          <MaterialCommunityIcons name="plus" size={15} color={t.orange} />
          <Text style={[common.addChipTxt, { color: t.orange }]}>
            {tr(selectedCategories.length ? 'newOrder.categoryAddMore' : 'newOrder.categoryAddBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: '100%',
  },
  selectedChipTxt: { color: '#fff', fontSize: 13, fontWeight: '600', flexShrink: 1 },
});
