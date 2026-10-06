import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';

// Qidiruv maydoni va filtr tugmasi. `embedded` — yo'nalish hero'si ichida
// (orqaga tugmasi bilan, shaffof uslubda) chiziladi.
export default function SearchFilterRow({
  embedded,
  onBack,
  query,
  onQueryChange,
  filterOpen,
  onToggleFilter,
  hasActiveFilters,
}) {
  const { t: tr } = useLanguage();
  const { t, styles } = useXizmatlarStyles();
  const [focused, setFocused] = useState(false);

  const onHeroTint = 'rgba(255,255,255,0.8)';

  return (
    <View style={[styles.header, embedded && styles.headerEmbedded]}>
      {embedded && (
        <TouchableOpacity style={styles.backBtnDark} onPress={onBack} activeOpacity={0.8}>
          <Feather name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
      )}
      <View style={[styles.searchBox, embedded && styles.searchBoxOnHero, focused && styles.searchBoxFocused]}>
        <Feather name="search" size={17} color={focused ? t.orange : embedded ? onHeroTint : t.faint} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={onQueryChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={tr('xizmatlar.searchPlaceholder')}
          placeholderTextColor={embedded ? 'rgba(255,255,255,0.65)' : t.faint}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => onQueryChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x-circle" size={16} color={embedded ? onHeroTint : t.faint} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.filterBtn,
          embedded && styles.filterBtnOnHero,
          filterOpen && (embedded ? styles.filterBtnActiveOnHero : styles.filterBtnActive),
        ]}
        onPress={onToggleFilter}
        activeOpacity={0.8}
      >
        <Feather
          name="sliders"
          size={19}
          color={filterOpen ? (embedded ? '#e87a45' : '#fff') : embedded ? '#fff' : t.faint}
        />
        {hasActiveFilters && <View style={styles.filterDot} />}
      </TouchableOpacity>
    </View>
  );
}
