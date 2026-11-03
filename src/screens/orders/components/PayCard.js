import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';

// Bajarilgan buyurtma uchun onlayn to'lov: summa va "Onlayn to'lash" tugmasi.
export default function PayCard({ amount, busy, onPay, t }) {
  const { t: tr } = useLanguage();

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={s.info}>
        <Text style={[s.label, { color: t.muted }]}>{tr('orderDetail.payTitle')}</Text>
        <Text style={[s.amount, { color: t.text }]}>
          {formatNumber(Math.round(amount))} {tr('common.currencySom')}
        </Text>
      </View>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: t.orange }]}
        activeOpacity={0.85}
        disabled={busy}
        onPress={onPay}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="credit-card-outline" size={17} color="#fff" />
            <Text style={s.btnText}>{tr('orderDetail.payOnline')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  info: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600' },
  amount: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  btn: {
    minWidth: 140,
    height: 44,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },
  btnText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
});
