import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

const SORTS = [
  { key: 'new', label: 'listings.sort.new', icon: 'clock-outline' },
  { key: 'price_asc', label: 'listings.sort.cheap', icon: 'sort-numeric-ascending' },
  { key: 'price_desc', label: 'listings.sort.expensive', icon: 'sort-numeric-descending' },
  { key: 'rating', label: 'listings.sort.rating', icon: 'star-outline' },
];

function Chip({ label, icon, active, onPress, small }) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        s.chip,
        small && s.chipSmall,
        {
          backgroundColor: active ? t.orange : t.card,
          borderColor: active ? t.orange : t.border,
        },
      ]}
    >
      {!!icon && <MaterialCommunityIcons name={icon} size={15} color={active ? '#fff' : t.muted} />}
      <Text style={[s.chipTxt, small && s.chipTxtSmall, { color: active ? '#fff' : t.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// E'lonlar ro'yxati tepasidagi qidiruv va filtrlar. Holat ekranda turadi, bu yerda faqat chiziladi.
export default function ListingsFilters({
  signedIn,
  saved,
  onSavedChange,
  query,
  onQueryChange,
  tree,
  parentId,
  subId,
  onPickParent,
  onPickSub,
  sort,
  onSortChange,
  priceActive,
  onOpenPrice,
  hasPhoto,
  onTogglePhoto,
  hideCategories,
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const parent = tree.find((c) => c.id === parentId);
  const children = parent?.children ?? [];

  return (
    <View style={s.wrap}>
      {signedIn && (
        <View style={[s.segment, { backgroundColor: t.card, borderColor: t.border }]}>
          {[
            { value: false, label: tr('listings.all'), icon: 'view-grid-outline' },
            { value: true, label: tr('listings.saved'), icon: 'bookmark-outline' },
          ].map((seg) => {
            const on = saved === seg.value;
            return (
              <TouchableOpacity
                key={String(seg.value)}
                onPress={() => onSavedChange(seg.value)}
                activeOpacity={0.85}
                style={[s.segBtn, on && { backgroundColor: t.orange }]}
              >
                <MaterialCommunityIcons name={seg.icon} size={16} color={on ? '#fff' : t.muted} />
                <Text style={[s.segTxt, { color: on ? '#fff' : t.muted }]}>{seg.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!saved && (
        <>
          <View style={[s.search, { backgroundColor: t.card, borderColor: t.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={t.muted} />
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              placeholder={tr('listings.searchPlaceholder')}
              placeholderTextColor={t.faint}
              returnKeyType="search"
              style={[s.searchInput, { color: t.text }]}
            />
            {!!query && (
              <TouchableOpacity
                onPress={() => onQueryChange('')}
                hitSlop={10}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="close-circle" size={18} color={t.faint} />
              </TouchableOpacity>
            )}
          </View>

          {!hideCategories && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.row}
            >
              <Chip
                label={tr('listings.all')}
                active={parentId == null}
                onPress={() => onPickParent(null)}
              />
              {tree.map((c) => (
                <Chip
                  key={c.id}
                  label={c.icon ? `${c.icon} ${c.name}` : c.name}
                  active={parentId === c.id}
                  onPress={() => onPickParent(c.id)}
                />
              ))}
            </ScrollView>
          )}

          {!hideCategories && children.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.row}
            >
              <Chip
                small
                label={tr('listings.allInDirection')}
                active={subId == null}
                onPress={() => onPickSub(null)}
              />
              {children.map((c) => (
                <Chip
                  key={c.id}
                  small
                  label={c.name}
                  active={subId === c.id}
                  onPress={() => onPickSub(c.id)}
                />
              ))}
            </ScrollView>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.row}
          >
            <Chip
              icon="tune-variant"
              label={tr('listings.filters.price')}
              active={priceActive}
              onPress={onOpenPrice}
            />
            <Chip
              icon="camera-outline"
              label={tr('listings.filters.withPhoto')}
              active={hasPhoto}
              onPress={onTogglePhoto}
            />
            <View style={[s.sep, { backgroundColor: t.border }]} />
            {SORTS.map((o) => (
              <Chip
                key={o.key}
                icon={o.icon}
                label={tr(o.label)}
                active={sort === o.key}
                onPress={() => onSortChange(o.key)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12, paddingBottom: 14 },
  segment: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginHorizontal: 20,
  },
  segBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segTxt: { fontSize: 13.5, fontWeight: '700' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginHorizontal: 20,
  },
  searchInput: { flex: 1, fontSize: 14.5, padding: 0 },
  row: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
  },
  chipSmall: { height: 32, paddingHorizontal: 12, borderRadius: 16 },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  chipTxtSmall: { fontSize: 12 },
  sep: { width: 1, height: 20, marginHorizontal: 2 },
});
