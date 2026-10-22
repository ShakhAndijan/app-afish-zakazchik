import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { digitsOnly, formatPrice } from '../utils';

// "Narx" filtri oynasi: narx oralig'i va narx turi (hammasi / narxli / kelishiladi).
// Ichki forma faqat oyna ochiqligida chiziladi, shuning uchun har ochilganda joriy qiymatdan boshlanadi.
export default function PriceFilterModal({ visible, value, onApply, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && <Sheet value={value} onApply={onApply} onClose={onClose} />}
    </Modal>
  );
}

function Sheet({ value, onApply, onClose }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [min, setMin] = useState(value.priceMin != null ? String(value.priceMin) : '');
  const [max, setMax] = useState(value.priceMax != null ? String(value.priceMax) : '');
  const [priced, setPriced] = useState(value.priced ?? null);

  const kinds = [
    { key: null, label: tr('listings.filters.any') },
    { key: true, label: tr('listings.filters.withPrice') },
    { key: false, label: tr('listings.negotiable') },
  ];
  // "Kelishiladi" e'lonlarida narx yo'q, shuning uchun u tanlansa oraliq ma'nosiz.
  const rangeDisabled = priced === false;

  const apply = () => {
    const lo = min ? Number(min) : null;
    const hi = max ? Number(max) : null;
    // Chegaralar teskari kiritilsa (masalan 500 000 dan 100 000 gacha) o'rni almashtiriladi.
    const [priceMin, priceMax] = lo != null && hi != null && lo > hi ? [hi, lo] : [lo, hi];
    onApply({
      priceMin: rangeDisabled ? null : priceMin,
      priceMax: rangeDisabled ? null : priceMax,
      priced,
    });
  };

  const field = (label, val, setVal) => (
    <View style={{ flex: 1 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{label}</Text>
      <View
        style={[
          s.inputBox,
          { backgroundColor: t.inputBg, borderColor: t.border, opacity: rangeDisabled ? 0.45 : 1 },
        ]}
      >
        <TextInput
          value={val ? formatPrice(Number(val)) : ''}
          onChangeText={(x) => setVal(digitsOnly(x).slice(0, 10))}
          editable={!rangeDisabled}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={t.faint}
          style={[s.input, { color: t.text }]}
        />
        <Text style={[s.unit, { color: t.faint }]}>{tr('common.currencySom')}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.backdrop}
    >
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={[s.card, { backgroundColor: t.bg, borderColor: t.border }]}>
        <View style={s.head}>
          <Text style={[s.title, { color: t.text }]}>{tr('listings.filters.priceTitle')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityRole="button">
            <MaterialCommunityIcons name="close" size={22} color={t.muted} />
          </TouchableOpacity>
        </View>

        <View style={s.kindRow}>
          {kinds.map((k) => {
            const on = priced === k.key;
            return (
              <TouchableOpacity
                key={String(k.key)}
                onPress={() => setPriced(k.key)}
                activeOpacity={0.85}
                style={[
                  s.kind,
                  {
                    backgroundColor: on ? t.orange : t.card,
                    borderColor: on ? t.orange : t.border,
                  },
                ]}
              >
                <Text style={[s.kindTxt, { color: on ? '#fff' : t.text }]}>{k.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.range}>
          {field(tr('listings.filters.from'), min, setMin)}
          {field(tr('listings.filters.to'), max, setMax)}
        </View>

        <View style={s.actions}>
          <TouchableOpacity
            onPress={() => onApply({ priceMin: null, priceMax: null, priced: null })}
            activeOpacity={0.85}
            style={[s.btn, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]}
          >
            <Text style={[s.btnTxt, { color: t.text }]}>{tr('listings.filters.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={apply}
            activeOpacity={0.85}
            style={[s.btn, { backgroundColor: t.orange, flex: 1.4 }]}
          >
            <Text style={[s.btnTxt, { color: '#fff' }]}>{tr('listings.filters.apply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: { width: '100%', maxWidth: 400, borderRadius: 26, borderWidth: 1, padding: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  kindRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  kind: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindTxt: { fontSize: 12.5, fontWeight: '700' },
  range: { flexDirection: 'row', gap: 10, marginTop: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 6,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '700', padding: 0 },
  unit: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 14.5, fontWeight: '800' },
});
