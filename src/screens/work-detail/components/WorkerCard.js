import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// "Bajargan usta" kartochkasi: bosilsa usta profili ochiladi.
export default function WorkerCard({ name, initial, color, rating, onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: t.muted }]}>{tr('workDetail.performingMaster')}</Text>
        <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={12} color={t.gold} />
        <Text style={[styles.ratingText, { color: t.gold }]}>{rating.toFixed(1)}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={t.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginTop: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  label: { fontSize: 11, fontWeight: '600' },
  name: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245,196,81,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '700' },
});
