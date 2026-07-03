import { View, Text, TextInput, StyleSheet } from 'react-native';

const formatPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return s;
};

export default function PhoneInput({ value = '', onChangeText, theme }) {
  const handleChange = (text) => {
    onChangeText(text.replace(/\D/g, '').slice(0, 9));
  };

  const isDark = !theme || theme.isDark !== false;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? '#0a1626' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
      },
    ]}>
      <View style={styles.prefix}>
        <Text style={styles.flag}>🇺🇿</Text>
        <Text style={[styles.code, { color: isDark ? '#fff' : '#0f1117' }]}>+998</Text>
      </View>
      <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)' }]} />
      <TextInput
        style={[styles.input, { color: isDark ? '#fff' : '#0f1117' }]}
        placeholder="90 123 45 67"
        placeholderTextColor={isDark ? '#6c7f9a' : '#8a97ab'}
        keyboardType="phone-pad"
        value={formatPhone(value)}
        onChangeText={handleChange}
        maxLength={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 15,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingRight: 13,
  },
  flag: { fontSize: 18 },
  code: { fontSize: 15, fontWeight: '700' },
  separator: { width: 1, height: 24, marginRight: 13 },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
    padding: 0,
  },
});
