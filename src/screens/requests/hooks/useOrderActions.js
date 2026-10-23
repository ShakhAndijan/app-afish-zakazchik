import { useState, useCallback } from 'react';
import { appAlert, appConfirm } from '../../../components/AppAlert';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../../context/LanguageContext';
import {
  agreeOrder,
  offerOrderPrice,
  cancelOrderByCustomer,
  declineOrder,
  sendOrderTo,
  publishOrder,
  recallOrder,
  repostOrder,
  completeOrder,
  workNotDone,
} from '../../../api/orders';
import { formatNumber } from '../../../utils/format';
import { getErrorMessage } from '../../../utils/errors';
import { formatDay, offerDay } from '../utils';

// Buyurtma ustidagi amallar: ustaning taklifini qabul qilish yoki rad etish, narx taklif qilish, bekor qilish.
// Har biri tugagach `onDone` (odatda buyurtmani qayta yuklash) chaqiriladi, xato bo'lsa ogohlantirish.
export default function useOrderActions(orderId, onDone) {
  const { t: tr } = useLanguage();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (action) => {
      setBusy(true);
      try {
        await action();
        // Buyurtmalar ro'yxati va bosh sahifadagi faol buyurtmalar yangilansin.
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['home', 'summary'] });
        await onDone?.();
        return true;
      } catch (e) {
        appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, 'requests.actionFailed'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onDone, tr, queryClient]
  );

  // Tasdiqlashdan keyin: ACCEPTED → ACTIVE. Matn saytdagidek: narx, sana va telefonlar ochilishi.
  const confirmAgree = useCallback(
    (order) =>
      appConfirm({
        title: tr('orderFlow.stage.agreeTitle'),
        message: tr('orderFlow.order.takeBody', {
          price: `${formatNumber(Math.round(order.offerPrice))} ${tr('common.currencySom')}`,
          day: formatDay(tr, offerDay(order)),
        }),
        confirmLabel: tr('orderFlow.stage.agree'),
        onConfirm: () => run(() => agreeOrder(orderId)),
      }),
    [orderId, run, tr]
  );

  // Javob bermagan ustaga yuborilgan buyurtmani qaytarib olish.
  const confirmRecall = useCallback(
    () =>
      appConfirm({
        title: tr('orderFlow.order.recallTitle'),
        message: tr('orderFlow.order.recallHint'),
        confirmLabel: tr('orderFlow.order.recall'),
        onConfirm: () => run(() => recallOrder(orderId)),
      }),
    [orderId, run, tr]
  );

  // Bekor qilingan buyurtmani qayta e'lon qilish.
  const repost = useCallback((payload) => run(() => repostOrder(orderId, payload)), [orderId, run]);

  // Ish bajarilganini tasdiqlash (yakuniy izoh ixtiyoriy).
  const complete = useCallback(
    (comment) => run(() => completeOrder(orderId, comment)),
    [orderId, run]
  );

  // "Ish hali bajarilmadi": ustaga xabar boradi. `left === 1` — oxirgi imkoniyat.
  const confirmNotDone = useCallback(
    (left) =>
      appConfirm({
        title: tr('orderFlow.stage.notDoneTitle'),
        message: [
          tr('orderFlow.stage.notDoneHint'),
          left === 1 ? tr('orderFlow.stage.notDoneLast') : null,
        ]
          .filter(Boolean)
          .join(' '),
        confirmLabel: tr('orderFlow.stage.notDone'),
        onConfirm: async () => {
          if (await run(() => workNotDone(orderId))) {
            appAlert(tr('orderFlow.stage.notDoneSent'));
          }
        },
      }),
    [orderId, run, tr]
  );

  // Kelishuvni to'xtatish: saytdagidek sababsiz, faqat tasdiqlash. `after` — muvaffaqiyatdan keyin.
  const confirmDecline = useCallback(
    (after) =>
      appConfirm({
        title: tr('orderFlow.stage.declineTitle'),
        message: tr('orderFlow.stage.declineHint'),
        confirmLabel: tr('orderFlow.stage.decline'),
        destructive: true,
        onConfirm: async () => {
          if (await run(() => declineOrder(orderId))) after?.();
        },
      }),
    [orderId, run, tr]
  );

  // Kelishuvni rad etish (saytdagi "Rad etish"): sabab majburiy; kelishuv to'xtaydi, buyurtma mijozga qaytadi.
  const decline = useCallback((reason) => run(() => declineOrder(orderId, reason)), [orderId, run]);

  // Qaytgan buyurtmani boshqa ustaga yuborish.
  const sendTo = useCallback(
    (workerId) => run(() => sendOrderTo(orderId, workerId)),
    [orderId, run]
  );

  // Qaytgan buyurtmani umumiy ro'yxatga chiqarish (tasdiqlashdan keyin).
  const confirmPublish = useCallback(
    () =>
      appConfirm({
        title: tr('requests.publishTitle'),
        message: tr('requests.publishHint'),
        confirmLabel: tr('requests.publish'),
        onConfirm: () => run(() => publishOrder(orderId)),
      }),
    [orderId, run, tr]
  );

  const offerPrice = useCallback(
    (price, day) => run(() => offerOrderPrice(orderId, price, day)),
    [orderId, run]
  );
  const cancel = useCallback(
    (reason) => run(() => cancelOrderByCustomer(orderId, reason)),
    [orderId, run]
  );

  return {
    busy,
    confirmDecline,
    confirmAgree,
    confirmRecall,
    confirmNotDone,
    repost,
    complete,
    decline,
    sendTo,
    confirmPublish,
    offerPrice,
    cancel,
  };
}

// "150 000" / "150000" → 150000 (yaroqsiz bo'lsa null).
export function parsePrice(text) {
  const n = Number(String(text).replace(/\D/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}
