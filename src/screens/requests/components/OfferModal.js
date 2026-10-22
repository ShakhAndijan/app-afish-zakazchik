import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import MoneyInput from '../../new-order/components/MoneyInput';
import FlowModal from './FlowModal';
import DayField from './DayField';
import { isDayValid } from '../utils';
import { parsePrice } from '../hooks/useOrderActions';

// "Narx taklif qilish": narx va ish sanasi (saytdagidek ikkalasi ham majburiy).
// Qabul qilinsa buyurtma shu sanaga belgilanadi.
export default function OfferModal({ visible, ...rest }) {
  // Forma har ochilganda yangidan boshlanadi (holat ochilganda qayta yaratiladi).
  return visible ? <OfferForm {...rest} /> : null;
}

function OfferForm({ order, busy, onClose, onSubmit }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [price, setPrice] = useState('');
  const [day, setDay] = useState(() => {
    const first = [order?.offerDate, order?.scheduledDate].find(isDayValid);
    return first ? first.slice(0, 10) : null;
  });

  const amount = parsePrice(price);

  return (
    <FlowModal
      visible
      title={tr('orderFlow.stage.offerTitle')}
      hint={tr('orderFlow.stage.offerHint')}
      confirmLabel={tr('orderFlow.stage.send')}
      disabled={!amount || !day}
      busy={busy}
      onClose={onClose}
      onSubmit={() => onSubmit(amount, day)}
    >
      <Text style={[s.label, { color: t.text }]}>{tr('orderFlow.talk.priceLabel')}</Text>
      <MoneyInput
        value={price}
        onChangeText={setPrice}
        placeholder={tr('requests.pricePlaceholder', { currency: tr('common.currencySom') })}
        suffix={tr('common.currencySom')}
        t={t}
      />
      <Text style={[s.label, { color: t.text }]}>{tr('orderFlow.order.offerDay')}</Text>
      <DayField value={day} onChange={setDay} />
      <Text style={[s.note, { color: t.muted }]}>{tr('orderFlow.order.offerDayHint')}</Text>
    </FlowModal>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700' },
  note: { fontSize: 12, lineHeight: 17 },
});
