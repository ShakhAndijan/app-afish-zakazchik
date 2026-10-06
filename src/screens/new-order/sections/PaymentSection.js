import { View, Text } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';
import PaymentOption from '../components/PaymentOption';

export default function PaymentSection({ paymentMethod, setPaymentMethod }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── To'lov ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.paymentLabel')}</Text>
      <PaymentOption
        icon="cash"
        iconBg={t.isDark ? 'rgba(31,163,124,0.18)' : '#E9F7F1'}
        iconColor="#1FA37C"
        title={tr('newOrder.payment.cash')}
        active={paymentMethod === 'cash'}
        onPress={() => setPaymentMethod('cash')}
        t={t}
      />
      <View style={{ height: 10 }} />
      <PaymentOption
        icon="credit-card-outline"
        iconBg={t.isDark ? 'rgba(47,128,214,0.18)' : '#E5F1FB'}
        iconColor="#2F80D6"
        title={tr('newOrder.payment.cashless')}
        subtitle={tr('newOrder.payment.cashlessHint')}
        active={paymentMethod === 'cashless'}
        onPress={() => setPaymentMethod('cashless')}
        t={t}
      />
    </>
  );
}
