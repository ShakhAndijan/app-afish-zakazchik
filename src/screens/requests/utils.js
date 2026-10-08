import { formatNumber } from '../../utils/format';

export const toMs = (value) => (typeof value === 'number' ? value : new Date(value).getTime());

// Zakazning ko'rinish holati (backend holati va kelishuv bosqichidan):
// pending | negotiating | offer (usta narx aytgan, javobingiz kutilyapti) | active | done | cancelled
export function orderState(order) {
  switch (order.rawStatus) {
    case 'pending':
      return 'pending';
    case 'accepted':
      return order.offerBy === 'worker' && order.offerPrice != null ? 'offer' : 'negotiating';
    case 'active':
      return 'active';
    case 'completed':
      return 'done';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

export const isOpenOrder = (order) => ['pending', 'accepted', 'active'].includes(order.rawStatus);

export const formatPrice = (tr, value) => `${formatNumber(Math.round(value))} ${tr('common.currencySom')}`;

// Karta va banner uchun matnlar. `tone` — theme rangi nomi.
export function describeOrder(order, tr) {
  const state = orderState(order);
  const name = order.master ?? '';

  switch (state) {
    case 'offer':
      return {
        state,
        tone: 'orange',
        icon: 'cash-check',
        title: tr('requests.statusOfferTitle', { name }),
        sub: tr('requests.statusOfferSub'),
        short: tr('requests.cardOffer', { name }),
      };
    case 'negotiating':
      return {
        state,
        tone: 'blue',
        icon: 'chat-processing-outline',
        title: tr('requests.statusNegotiatingTitle', { name }),
        sub: tr('requests.statusNegotiatingSub'),
        short: tr('requests.cardNegotiating', { name }),
      };
    case 'active':
      return {
        state,
        tone: 'green',
        icon: 'hammer-wrench',
        title: tr('requests.statusActiveTitle'),
        sub: tr('requests.statusActiveSub', { name }),
        short: tr('requests.cardActive', { name }),
      };
    case 'done':
      return {
        state,
        tone: 'green',
        icon: 'check-circle-outline',
        title: tr('requests.statusDoneTitle'),
        sub: tr('requests.statusDoneSub'),
        short: tr('requests.cardDone'),
      };
    case 'cancelled':
      return {
        state,
        tone: 'red',
        icon: 'close-circle-outline',
        title: tr('requests.statusCancelledTitle'),
        sub: tr('requests.statusCancelledSub'),
        short: tr('requests.cardCancelled'),
      };
    default:
      return {
        state,
        tone: 'gold',
        icon: 'magnify',
        title: tr('requests.statusPendingTitle'),
        sub: tr('requests.statusPendingSub'),
        short: tr('requests.cardPending'),
      };
  }
}

export function timeLabel(tr, value) {
  const ts = toMs(value);
  const minutes = Math.floor((Date.now() - ts) / 60000);
  if (minutes < 1) return tr('requests.justNow');
  if (minutes < 60) return tr('requests.minAgo', { n: minutes });
  return clockLabel(ts);
}

export function clockLabel(value) {
  const d = new Date(toMs(value));
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
