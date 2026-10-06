import { View, Text, TouchableOpacity } from 'react-native';
import { useXizmatlarStyles } from '../styles';
import CategoryGlyph from './CategoryGlyph';

// Yo'nalish kartochkasi (ustalar soni nishoni, ikonka, nom).
// variant="popular" — gorizontal ro'yxat uchun; "grid" — pastdagi to'r uchun.
export default function CategoryTile({ item, onPress, variant = 'grid' }) {
  const { styles } = useXizmatlarStyles();
  const popular = variant === 'popular';

  return (
    <TouchableOpacity
      style={popular ? styles.popularTile : styles.categoryCard}
      onPress={onPress}
      activeOpacity={popular ? 0.85 : 0.2}
    >
      {item.count > 0 && (
        <View style={[styles.categoryBadge, { backgroundColor: item.color }]}>
          <Text style={styles.categoryBadgeText}>{item.count}</Text>
        </View>
      )}
      <View style={[styles.categoryIconWrap, { backgroundColor: item.color + '22' }]}>
        <CategoryGlyph glyph={item.glyph} color={item.color} />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={popular ? 1 : undefined}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}
