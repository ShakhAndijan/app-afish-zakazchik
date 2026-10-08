import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';
import { describeOrder, formatPrice } from '../utils';

// Bosh sahifadagi faol zakaz kartasi: yo'nalish, holat va (usta tayinlangan bo'lsa) usta
// avatari. Usta narx aytib, javobingiz kutilayotgan bo'lsa belgi chiqadi.
export default function RequestCard({ order, title, onPress }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const info = describeOrder(order, tr);
  const color = t[info.tone] ?? t.orange;
  const needsReply = info.state === 'offer';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      style={[s.card, { backgroundColor: t.card, borderColor: needsReply ? t.orange : t.border }]}
    >
      <View style={[s.icon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={info.icon} size={22} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[s.sub, { color }]} numberOfLines={1}>
          {info.short}
        </Text>
        {order.offerPrice != null && info.state === 'offer' && (
          <Text style={[s.price, { color: t.muted }]}>{formatPrice(tr, order.offerPrice)}</Text>
        )}
        {order.agreedPrice != null && info.state === 'active' && (
          <Text style={[s.price, { color: t.muted }]}>{formatPrice(tr, order.agreedPrice)}</Text>
        )}
      </View>

      {!!order.master && (
        <Avatar letter={order.letter} bgColor={order.color} uri={order.masterPhoto} size={30} />
      )}

      {needsReply ? (
        <View style={[s.dot, { backgroundColor: t.orange }]} />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={22} color={t.faint} />
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
  },
  icon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 14.5 },
  sub: { fontWeight: '600', fontSize: 12, marginTop: 3 },
  price: { fontSize: 11.5, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
