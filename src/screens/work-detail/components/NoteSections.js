import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import SectionLabel from '../../orders/components/SectionLabel';

function NoteCard({ header, text }) {
  const { theme: t } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {header}
      <Text style={[styles.text, { color: t.muted }]}>{text}</Text>
    </View>
  );
}

function Avatar({ color, initial }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

// "Usta izohi": usta nomi (profilga o'tadi) va izoh matni.
export function MasterNoteSection({ name, initial, color, text, mock, onPressMaster }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      <SectionLabel mock={mock} t={t}>
        {tr('workDetail.masterNoteTitle')}
      </SectionLabel>
      <NoteCard
        text={text}
        header={
          <TouchableOpacity style={styles.header} onPress={onPressMaster} activeOpacity={0.7}>
            <Avatar color={color} initial={initial} />
            <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
              {name}
            </Text>
            <Feather name="chevron-right" size={15} color={t.muted} />
          </TouchableOpacity>
        }
      />
    </>
  );
}

// "Mijoz sharhi": sharh egasi, bahosi va matni.
export function CustomerReviewSection({ review, mock }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      <SectionLabel mock={mock} t={t}>
        {tr('workDetail.customerReviewTitle')}
      </SectionLabel>
      <NoteCard
        text={review.text}
        header={
          <View style={styles.header}>
            <Avatar color={review.color} initial={review.initial} />
            <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
              {review.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={t.gold} />
              <Text style={[styles.ratingText, { color: t.gold }]}>{Number(review.rating).toFixed(1)}</Text>
            </View>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  name: { flex: 1, fontSize: 13.5, fontWeight: '700' },
  text: { fontSize: 13, lineHeight: 19 },
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
