import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Uchta faollik ko'rsatkichi: buyurtmalar, sevimli ustalar, mijoz reytingi. Olinmagan qiymat — "—".
export default function ActivityStats({ stats }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const items = [
    { value: stats.orders ?? '—', label: tr('profile.stats.orders'), icon: 'archive-outline', color: t.orange },
    {
      value: stats.favorites ?? '—',
      label: tr('profile.stats.favoriteMasters'),
      icon: 'heart-outline',
      color: t.red,
    },
    {
      value: stats.rating != null ? stats.rating.toFixed(1) : '—',
      label: tr('profile.stats.yourRating'),
      icon: 'star-outline',
      color: t.gold,
    },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={[styles.pill, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={[styles.icon, { backgroundColor: item.color + '1c' }]}>
            <MaterialCommunityIcons name={item.icon} size={13} color={item.color} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.value, { color: t.text }]} numberOfLines={1}>
              {item.value}
            </Text>
            <Text style={[styles.label, { color: t.muted }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
          <View style={[styles.accent, { backgroundColor: item.color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 9, marginTop: 18 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value: { fontWeight: '800', fontSize: 14 },
  label: { fontSize: 9.5, marginTop: 1 },
  accent: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 0,
    height: 2.5,
    borderRadius: 2,
  },
});
