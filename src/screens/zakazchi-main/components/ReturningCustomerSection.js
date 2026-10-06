import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import Avatar from '../../../components/Avatar';
import { STATUS_META, statusLabel } from '../../orders/constants';
import SectionHeader from './SectionHeader';

// Buyurtmasi bor mijoz uchun shaxsiy blok: faol buyurtmalar va oxirgi bajarilgan
// buyurtmani qayta berish. Ikkalasi ham bo'lmasa, hech narsa chizilmaydi.
export default function ReturningCustomerSection({ summary, onOpenOrders, onReorder }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const active = summary?.activeOrders ?? [];
  const lastDone = summary?.lastDone ?? null;
  if (active.length === 0 && !lastDone) return null;

  const first = active[0];
  const activeTitle =
    first?.task || first?.service || tr('orderDetail.orderNumber', { id: first?.id });
  const activeSub = first
    ? [first.master || tr('orders.noMasterYet'), statusLabel(tr, first)].join(' · ')
    : '';

  return (
    <>
      <SectionHeader title={tr('homeExtra.personalTitle')} />
      <View style={{ gap: 12 }}>
        {!!first && (
          <TouchableOpacity
            onPress={onOpenOrders}
            activeOpacity={0.85}
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <View style={[s.accent, { backgroundColor: STATUS_META.active.color }]} />
            <View style={[s.icon, { backgroundColor: STATUS_META.active.bg }]}>
              <MaterialCommunityIcons
                name={STATUS_META.active.icon}
                size={22}
                color={STATUS_META.active.color}
              />
            </View>
            <View style={s.body}>
              <Text style={[s.label, { color: STATUS_META.active.color }]}>
                {tr('homeExtra.activeOrder')}
                {active.length > 1 ? ` · ${tr('homeExtra.activeMore', { n: active.length - 1 })}` : ''}
              </Text>
              <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
                {activeTitle}
              </Text>
              <Text style={[s.sub, { color: t.muted }]} numberOfLines={1}>
                {activeSub}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={t.faint} />
          </TouchableOpacity>
        )}

        {!!lastDone && (
          <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <Avatar
              letter={lastDone.letter}
              bgColor={lastDone.color}
              uri={lastDone.masterPhoto}
              size={44}
            />
            <View style={s.body}>
              <Text style={[s.label, { color: t.muted }]}>{tr('homeExtra.reorderTitle')}</Text>
              <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
                {lastDone.master}
              </Text>
              <Text style={[s.sub, { color: t.muted }]} numberOfLines={1}>
                {lastDone.task || lastDone.service}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onReorder(lastDone)}
              activeOpacity={0.85}
              accessibilityRole="button"
              style={[s.cta, { backgroundColor: t.orange }]}
            >
              <MaterialCommunityIcons name="refresh" size={15} color="#fff" />
              <Text style={s.ctaTxt}>{tr('homeExtra.reorderCta')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  title: { fontSize: 14.5, fontWeight: '700', marginTop: 2 },
  sub: { fontSize: 12.5, marginTop: 2 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  ctaTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
});
