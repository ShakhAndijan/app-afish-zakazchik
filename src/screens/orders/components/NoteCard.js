import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';

function Stars({ rating, t }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={13} color={i <= rating ? t.gold : t.border} />
      ))}
    </View>
  );
}

// Usta izohi (usta nomi bosilsa uning profiliga o'tadi).
export function MasterNoteCard({ order, text, onPressMaster, t }) {
  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <TouchableOpacity
        style={s.header}
        onPress={onPressMaster}
        disabled={!order.workerId}
        activeOpacity={0.7}
      >
        <Avatar letter={order.letter} bgColor={order.color} uri={order.masterPhoto} size={32} />
        <Text style={[s.name, { color: t.text, flex: 1 }]} numberOfLines={1}>
          {order.master}
        </Text>
        {!!order.workerId && <Feather name="chevron-right" size={15} color={t.muted} />}
      </TouchableOpacity>
      <Text style={[s.text, { color: t.muted }]}>{text}</Text>
    </View>
  );
}

// Mijozning (foydalanuvchining) o'z sharhi va bahosi.
export function CustomerReviewCard({ rating, text, t }) {
  const { t: tr } = useLanguage();

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={s.header}>
        <View style={[s.youAvatar, { backgroundColor: t.orange }]}>
          <MaterialCommunityIcons name="account" size={16} color="#fff" />
        </View>
        <Text style={[s.name, { color: t.text, flex: 1 }]}>{tr('orderDetail.you')}</Text>
        <Stars rating={rating} t={t} />
      </View>
      <Text style={[s.text, { color: t.muted }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  youAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13.5, fontWeight: '700' },
  text: { fontSize: 13, lineHeight: 19 },
});
