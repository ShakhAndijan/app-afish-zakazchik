import { View, Text, TextInput, StyleSheet } from 'react-native';
import { formatPhone } from '../utils';

export default function PhoneField({ value, onChangeText, placeholder, t }) {
  return (
    <View style={[s.phoneRow, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[s.phonePrefix, { borderColor: t.border }]}>
        <Text style={[s.phonePrefixTxt, { color: t.text }]}>+998</Text>
      </View>
      <TextInput
        value={formatPhone(value)}
        onChangeText={(v) => onChangeText(v.replace(/D/g, '').slice(0, 9))}
        keyboardType="phone-pad"
        placeholder={placeholder}
        placeholderTextColor={t.faint}
        maxLength={12}
        style={[s.phoneInput, { color: t.text }]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 50,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1.5,
  },
  phonePrefixTxt: { fontSize: 14, fontWeight: '700' },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
