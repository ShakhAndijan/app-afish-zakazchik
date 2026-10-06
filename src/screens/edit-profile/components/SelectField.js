import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { s } from '../styles';

// Bosilganda tanlov oynasini (OptionSheet / BirthDateSheet) ochadigan maydon.
export default function SelectField({ label, value, placeholder, onPress, disabled }) {
  const { theme: t } = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <Text style={[s.fieldLabel, { color: t.muted }]}>{label}</Text>
      <TouchableOpacity
        style={[
          s.inputWrap,
          { backgroundColor: t.inputBg, borderColor: t.border, opacity: disabled ? 0.5 : 1 },
        ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
      >
        <Text style={[s.input, { color: value ? t.text : t.faint }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={t.faint} />
      </TouchableOpacity>
    </View>
  );
}
