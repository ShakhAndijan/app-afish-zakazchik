import { View, TextInput, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

// Email kiritish maydoni (PhoneInput bilan bir xil ko'rinishda).
export default function EmailInput({ value = '', onChangeText, theme, placeholder }) {
  const isDark = !theme || theme.isDark !== false;

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
      <Feather name="mail" size={19} color={isDark ? '#8da0ba' : '#8a97ab'} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: isDark ? '#fff' : '#0f1117' }]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6c7f9a' : '#8a97ab'}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        value={value}
        onChangeText={onChangeText}
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
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
});
