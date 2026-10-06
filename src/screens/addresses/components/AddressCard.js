import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { ADDRESS_LABELS } from '../constants';

// Bitta saqlangan manzil kartochkasi. `primary` bo'lsa "Asosiy" belgisi chiqadi,
// `onDelete` berilmasa o'chirish tugmasi ko'rinmaydi.
export default function AddressCard({ address, primary, onPress, onDelete, t }) {
  const { t: tr } = useLanguage();
  const meta = ADDRESS_LABELS[address.label] ?? ADDRESS_LABELS.other;
  const color = t[meta.color];

  const area = [address.districtName, address.regionName].filter(Boolean).join(', ');
  const title = address.street || area || tr('addresses.noText');
  const sub = address.street ? area : '';
  const unit = [
    address.entrance ? tr('addresses.entrance', { n: address.entrance }) : '',
    address.floor ? tr('addresses.floor', { n: address.floor }) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
    >
      <View style={[s.iconBox, { backgroundColor: color + '1f' }]}>
        <MaterialCommunityIcons name={meta.icon} size={22} color={color} />
      </View>

      <View style={s.body}>
        <View style={s.titleRow}>
          <Text style={[s.label, { color }]}>{tr(`addresses.labels.${address.label}`)}</Text>
          {primary && (
            <View style={[s.badge, { backgroundColor: t.orange + '1f' }]}>
              <Text style={[s.badgeTxt, { color: t.orange }]}>{tr('addresses.primaryBadge')}</Text>
            </View>
          )}
          {address.lat != null && (
            <MaterialCommunityIcons name="crosshairs-gps" size={13} color={t.faint} />
          )}
        </View>
        <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
          {title}
        </Text>
        {!!sub && (
          <Text style={[s.sub, { color: t.muted }]} numberOfLines={1}>
            {sub}
          </Text>
        )}
        {!!unit && <Text style={[s.sub, { color: t.faint }]}>{unit}</Text>}
      </View>

      <View style={s.actions}>
        <MaterialCommunityIcons name="pencil-outline" size={19} color={t.muted} />
        {!!onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={tr('addresses.delete')}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={19} color={t.red} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 },
  label: { fontSize: 11.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeTxt: { fontSize: 10.5, fontWeight: '700' },
  title: { fontSize: 14.5, fontWeight: '700', lineHeight: 20 },
  sub: { fontSize: 12.5, marginTop: 2 },
  actions: { alignItems: 'center', gap: 14 },
});
