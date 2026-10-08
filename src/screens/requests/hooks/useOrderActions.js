import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { agreeOrder, offerOrderPrice, cancelOrderByCustomer } from '../../../api/orders';
import { formatNumber } from '../../../utils/format';

// Zakaz ustidagi amallar: ustaning taklifini qabul qilish, narx taklif qilish, bekor qilish.
// Har biri tugagach `onDone` (odatda zakazni qayta yuklash) chaqiriladi, xato bo'lsa ogohlantirish.
export default function useOrderActions(orderId, onDone) {
  const { t: tr } = useLanguage();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (action) => {
      setBusy(true);
      try {
        await action();
        await onDone?.();
        return true;
      } catch (e) {
        Alert.alert(tr('common.errorTitle'), e?.message || tr('requests.actionFailed'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onDone, tr]
  );

  // Tasdiqlashdan keyin: ACCEPTED → ACTIVE.
  const confirmAgree = useCallback(
    (order) =>
      Alert.alert(
        tr('requests.agreeConfirmTitle', {
          price: formatNumber(Math.round(order.offerPrice)),
          currency: tr('common.currencySom'),
        }),
        tr('requests.agreeConfirmText'),
        [
          { text: tr('requests.close'), style: 'cancel' },
          { text: tr('requests.agree'), onPress: () => run(() => agreeOrder(orderId)) },
        ]
      ),
    [orderId, run, tr]
  );

  const offerPrice = useCallback((price) => run(() => offerOrderPrice(orderId, price)), [orderId, run]);
  const cancel = useCallback(
    (reason) => run(() => cancelOrderByCustomer(orderId, reason)),
    [orderId, run]
  );

  return { busy, confirmAgree, offerPrice, cancel };
}

// "150 000" / "150000" → 150000 (yaroqsiz bo'lsa null).
export function parsePrice(text) {
  const n = Number(String(text).replace(/\D/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}
