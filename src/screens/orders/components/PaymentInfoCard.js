import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { PAYMENT_STATUS_COLOR } from '../constants';
import InfoRow from './InfoRow';

function Pill({ bg, color, children }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color }]}>{children}</Text>
    </View>
  );
}

// "Buyurtma va to'lov" kartasi: holat, to'lov usuli va to'lov holati.
export default function PaymentInfoCard({ order, meta, statusLabel }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const paymentColor =
    PAYMENT_STATUS_COLOR[order.paymentStatus] || PAYMENT_STATUS_COLOR.not_charged;
  const divider = <View style={[s.divider, { backgroundColor: t.border }]} />;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <InfoRow
        icon="info"
        label={tr('orderDetail.status')}
        t={t}
        right={
          <Pill bg={meta.bg} color={meta.color}>
            {statusLabel}
          </Pill>
        }
      />
      {divider}
      <InfoRow
        icon="credit-card"
        label={tr('orderDetail.paymentMethod')}
        value={order.paymentMethod ? tr(`orderDetail.paymentMethods.${order.paymentMethod}`) : '—'}
        t={t}
      />
      {divider}
      <InfoRow
        icon="pocket"
        label={tr('orderDetail.paymentStatusLabel')}
        t={t}
        right={
          <Pill bg={paymentColor + '22'} color={paymentColor}>
            {tr(`orderDetail.paymentStatus.${order.paymentStatus}`)}
          </Pill>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  divider: { height: 1, marginVertical: 4 },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 11, fontWeight: '700' },
});
