import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { s } from '../styles';

// Matn maydoni (ixtiyoriy ko'p qatorli va belgilar hisoblagichi bilan).
export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  maxLength,
}) {
  const { theme: t } = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{label}</Text>
      <View
        style={[
          s.inputWrap,
          multiline && s.inputWrapMultiline,
          { backgroundColor: t.inputBg, borderColor: t.border },
        ]}
      >
        <TextInput
          style={[s.input, multiline && s.inputMultiline, { color: t.text }]}
          placeholder={placeholder}
          placeholderTextColor={t.faint}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {maxLength ? (
        <Text style={[s.counter, { color: t.faint }]}>
          {(value || '').length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}
