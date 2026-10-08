import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Faollik ko'rsatkichlari: buyurtmalar, sevimli ustalar, mijoz reytingi. Olinmagan qiymat — "—".
// Bitta ixcham karta, ustunlar ingichka chiziq bilan ajratilgan; profil tepa blokining pastki
// chetiga suzib turadi. `onOrdersPress` berilsa "Buyurtma" ustuni buyurtmalar tarixini ochadi.
export default function ActivityStats({ stats, onOrdersPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const items = [
    {
      key: 'orders',
      value: stats.orders ?? '—',
      label: tr('profile.stats.orders'),
      icon: 'clipboard-text-outline',
      color: t.orange,
      onPress: onOrdersPress,
    },
    {
      key: 'favorites',
      value: stats.favorites ?? '—',
      label: tr('profile.stats.favoriteMasters'),
      icon: 'heart-outline',
      color: t.red,
    },
    {
      key: 'rating',
      value: stats.rating != null ? stats.rating.toFixed(1) : '—',
      label: tr('profile.stats.yourRating'),
      icon: 'star-outline',
      color: t.gold,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={item.key}
          activeOpacity={item.onPress ? 0.7 : 1}
          disabled={!item.onPress}
          onPress={item.onPress}
          accessibilityRole={item.onPress ? 'button' : undefined}
          style={[styles.col, i > 0 && { borderLeftWidth: 1, borderLeftColor: t.border }]}
        >
          <View style={styles.valueRow}>
            <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
            <Text style={[styles.value, { color: t.text }]} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
          <Text
            style={[styles.label, { color: t.muted }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 20,
    marginTop: -26,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  col: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontWeight: '800', fontSize: 20, letterSpacing: -0.3 },
  label: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
});
