import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';

// Buyurtmaga biriktirilgan usta. Usta tanlanmagan bo'lsa bosilmaydi.
// `rating` — mock (backend usta reytingini buyurtma javobida bermaydi).
export default function MasterCard({ order, rating, onPress, t }) {
  const { t: tr } = useLanguage();
  const Wrapper = order.workerId ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
      {...(order.workerId ? { onPress, activeOpacity: 0.8 } : {})}
    >
      <Avatar letter={order.letter} bgColor={order.color} uri={order.masterPhoto} size={46} />
      <View style={{ flex: 1 }}>
        <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
          {order.master || tr('orders.noMasterYet')}
        </Text>
        {!!order.service && (
          <Text style={[s.trade, { color: t.muted }]} numberOfLines={1}>
            {order.service}
          </Text>
        )}
      </View>
      {rating != null && (
        <View style={s.ratingBadge}>
          <Ionicons name="star" size={12} color={t.gold} />
          <Text style={[s.ratingText, { color: t.gold }]}>{rating.toFixed(1)}</Text>
        </View>
      )}
      {!!order.workerId && <Feather name="chevron-right" size={16} color={t.muted} />}
    </Wrapper>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  name: { fontSize: 15, fontWeight: '700' },
  trade: { fontSize: 12, fontWeight: '600', marginTop: 2 },
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
