import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatYears } from '../utils/format';
import Avatar from './Avatar';
import PresenceBadge from './PresenceBadge';

// Usta kartochkasi ("Eng zo'r ustalar"): mehmon va mijoz bosh sahifasida bir xil ko'rinadi.
// Yuqorida avatar, ism, kasb va reyting; o'rtada manzil va tajriba (uzun matn qirqiladi, kartadan chiqmaydi);
// pastda boshlang'ich narx. `rank` — ro'yxatdagi o'rin (0 = birinchi, unga "#1" nishoni qo'yiladi).
export default function WorkerCard({ worker, rank, onPress, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const w = worker;

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: t.card, borderColor: t.border }, style]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={w.name}
    >
      <View style={s.top}>
        <View>
          <Avatar letter={w.initial} size={56} bgColor={w.color} uri={w.profile_photo} />
          {rank === 0 && (
            <View style={s.rankBadge}>
              <Text style={s.rankText}>#1</Text>
            </View>
          )}
        </View>

        <View style={s.info}>
          <View style={s.nameRow}>
            <Text style={[s.name, { color: t.text }]} numberOfLines={1}>
              {w.name}
            </Text>
            {w.isIdentityVerified && (
              <MaterialCommunityIcons name="check-decagram" size={15} color={t.blue} />
            )}
          </View>
          <Text style={[s.prof, { color: t.muted }]} numberOfLines={1}>
            {w.profession || tr('zakazchiMain.defaultProfession')}
          </Text>
          <PresenceBadge worker={w} style={{ marginTop: 6 }} />
        </View>

        {w.rating > 0 && (
          <View style={[s.rating, { backgroundColor: 'rgba(245,196,81,0.14)' }]}>
            <Ionicons name="star" size={13} color={t.gold} />
            <Text style={[s.ratingText, { color: t.gold }]}>{w.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {(!!w.location || w.experienceYears > 0) && (
        <View style={s.chips}>
          {!!w.location && (
            <View style={[s.chip, s.chipShrink, { backgroundColor: t.rowIconBg }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={13} color={t.muted} />
              <Text style={[s.chipText, { color: t.muted }]} numberOfLines={1}>
                {w.location}
              </Text>
            </View>
          )}
          {w.experienceYears > 0 && (
            <View style={[s.chip, { backgroundColor: t.rowIconBg }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={13} color={t.muted} />
              <Text style={[s.chipText, { color: t.muted }]} numberOfLines={1}>
                {formatYears(tr, w.experienceYears)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={[s.footer, { borderTopColor: t.border }]}>
        <Text style={[s.price, { color: t.orange }]} numberOfLines={1}>
          {tr('app.engZorUstalar.priceFrom', { price: w.startingPrice })}
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color={t.orange} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 15.5, fontWeight: '700', flexShrink: 1 },
  prof: { fontSize: 12.5, marginTop: 3 },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  ratingText: { fontSize: 13, fontWeight: '800' },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#f5c451',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
  },
  rankText: { fontSize: 9, fontWeight: '800', color: '#3a2a08' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipShrink: { flexShrink: 1 },
  chipText: { fontSize: 12, flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  price: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
});
