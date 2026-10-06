import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { common } from '../styles';
import MoneyInput from '../components/MoneyInput';

export default function PricingSection({ pricingType, setPricingType, hourlyRate, setHourlyRate, estimatedHours, setEstimatedHours, fixedPrice, setFixedPrice }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <>
      {/* ── Narx ── */}
      <Text style={[common.label, { color: t.text }]}>{tr('newOrder.pricingLabel')}</Text>
      <View style={s.pricingToggleRow}>
        <TouchableOpacity
          onPress={() => setPricingType('hourly')}
          activeOpacity={0.85}
          style={[
            s.pricingPill,
            {
              backgroundColor: pricingType === 'hourly' ? t.orange : t.card,
              borderColor: pricingType === 'hourly' ? t.orange : t.border,
            },
          ]}
        >
          <Text
            style={[
              s.pricingPillTxt,
              { color: pricingType === 'hourly' ? '#fff' : t.text },
            ]}
          >
            {tr('newOrder.pricing.hourly')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPricingType('fixed')}
          activeOpacity={0.85}
          style={[
            s.pricingPill,
            {
              backgroundColor: pricingType === 'fixed' ? t.orange : t.card,
              borderColor: pricingType === 'fixed' ? t.orange : t.border,
            },
          ]}
        >
          <Text
            style={[
              s.pricingPillTxt,
              { color: pricingType === 'fixed' ? '#fff' : t.text },
            ]}
          >
            {tr('newOrder.pricing.fixed')}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[common.hint, { color: t.muted, marginTop: 6 }]}>
        {pricingType === 'hourly'
          ? tr('newOrder.pricing.hourlyHint')
          : tr('newOrder.pricing.fixedHint')}
      </Text>
      {pricingType === 'hourly' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MoneyInput
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder={tr('newOrder.pricing.ratePlaceholder')}
            suffix={tr('common.currencySom')}
            style={{ flex: 1 }}
            t={t}
          />
          <TextInput
            value={estimatedHours}
            onChangeText={setEstimatedHours}
            keyboardType="number-pad"
            placeholder={tr('newOrder.pricing.hoursPlaceholder')}
            placeholderTextColor={t.faint}
            style={[
              common.input,
              { flex: 1, backgroundColor: t.card, borderColor: t.border, color: t.text },
            ]}
          />
        </View>
      ) : (
        <MoneyInput
          value={fixedPrice}
          onChangeText={setFixedPrice}
          placeholder={tr('newOrder.pricing.fixedPricePlaceholder')}
          suffix={tr('common.currencySom')}
          t={t}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  pricingToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pricingPill: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  pricingPillTxt: { fontSize: 13, fontWeight: '700' },
});
