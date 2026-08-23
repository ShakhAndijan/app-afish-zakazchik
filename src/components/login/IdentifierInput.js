import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { detectIdentifierMode } from '../../utils/identifier';

const formatPhoneDigits = (raw = '') => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return s;
};

export default function IdentifierInput({ value = '', onChangeText, theme, placeholder }) {
  const isDark = !theme || theme.isDark !== false;
  const mode = detectIdentifierMode(value);
  const isPhone = mode === 'phone';
  const wasFocusedRef = useRef(false);

  const handleChange = (text) => {
    const nextMode = detectIdentifierMode(text);
    onChangeText(nextMode === 'phone' ? text.replace(/\D/g, '').slice(0, 9) : text);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0a1626' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
        },
      ]}
    >
      {isPhone && (
        <>
          <View style={styles.prefix}>
            <Text style={styles.flag}>🇺🇿</Text>
            <Text style={[styles.code, { color: isDark ? '#fff' : '#0f1117' }]}>+998</Text>
          </View>
          <View
            style={[
              styles.separator,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)' },
            ]}
          />
        </>
      )}
      <TextInput
        // OS klaviaturasi fokusda turgan inputning keyboardType'i o'zgarishini
        // darhol qo'llamaydi (ayniqsa iOS'da) — shuning uchun rejim almashganda
        // inputni key orqali qayta mount qilib, autoFocus bilan klaviaturani
        // yangi turi bilan qayta ochamiz.
        key={mode}
        autoFocus={wasFocusedRef.current}
        onFocus={() => { wasFocusedRef.current = true; }}
        style={[styles.input, { color: isDark ? '#fff' : '#0f1117' }]}
        placeholder={isPhone ? '90 123 45 67' : placeholder}
        placeholderTextColor={isDark ? '#6c7f9a' : '#8a97ab'}
        keyboardType={isPhone ? 'phone-pad' : mode === 'email' ? 'email-address' : 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        value={isPhone ? formatPhoneDigits(value) : value}
        onChangeText={handleChange}
        maxLength={isPhone ? 12 : undefined}
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
