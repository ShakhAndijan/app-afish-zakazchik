import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function InputField({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoFocus, icon }) {
  return (
    <View style={styles.group}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.faint}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoFocus={autoFocus}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 9,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 15,
    gap: 11,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
});
