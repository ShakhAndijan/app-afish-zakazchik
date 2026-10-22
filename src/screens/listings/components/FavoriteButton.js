import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import useListingFavorite from '../hooks/useListingFavorite';

// Yumaloq "saqlash" tugmasi: rasm ustida (`overlay`) yoki sarlavha panelida (`overlay` yo'q) ishlatiladi.
export default function FavoriteButton({ listing, size = 34, overlay = false, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const toggle = useListingFavorite();
  const active = !!listing.isFavorite;

  return (
    <TouchableOpacity
      onPress={() => toggle(listing)}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={tr(active ? 'listings.unsave' : 'listings.save')}
      style={[
        s.btn,
        { width: size, height: size, borderRadius: size / 2 },
        overlay
          ? { backgroundColor: 'rgba(12,24,40,0.55)' }
          : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={active ? 'bookmark' : 'bookmark-outline'}
        size={Math.round(size * 0.52)}
        color={active ? t.orange : overlay ? '#fff' : t.text}
      />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({ btn: { alignItems: 'center', justifyContent: 'center' } });
