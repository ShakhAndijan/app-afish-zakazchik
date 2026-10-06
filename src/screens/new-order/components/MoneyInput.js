import { View, Text, TextInput, StyleSheet } from 'react-native';
import { formatMoney } from '../utils';

export default function MoneyInput({ value, onChangeText, placeholder, suffix, style, t }) {
  return (
    <View style={[s.moneyRow, { backgroundColor: t.card, borderColor: t.border }, style]}>
      <TextInput
        value={formatMoney(value)}
        onChangeText={(v) => onChangeText(v.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={t.faint}
        style={[s.moneyInput, { color: t.text }]}
      />
      {!!suffix && <Text style={[s.moneySuffix, { color: t.muted }]}>{suffix}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 50,
    paddingLeft: 14,
    paddingRight: 12,
  },
  moneyInput: { flex: 1, fontSize: 14, height: '100%' },
  moneySuffix: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
});
