import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function PasswordInput({ value = '', onChangeText, theme, placeholder = 'Parolni kiriting' }) {
  const [show, setShow] = useState(false);
  const isDark = !theme || theme.isDark !== false;
  const faint = isDark ? '#6c7f9a' : '#8a97ab';

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? '#0a1626' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
      },
    ]}>
      <Feather name="lock" size={19} color={faint} />
      <TextInput
        style={[styles.input, { color: isDark ? '#fff' : '#0f1117' }]}
        placeholder={placeholder}
        placeholderTextColor={faint}
        secureTextEntry={!show}
        autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity
        onPress={() => setShow((s) => !s)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name={show ? 'eye-off' : 'eye'} size={19} color={faint} />
      </TouchableOpacity>
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
    gap: 11,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
});
