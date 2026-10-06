import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { common } from '../styles';

export default function SelectField({ label, value, placeholder, onPress, t, bg, disabled }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[common.label, { color: t.text, marginTop: 0, marginBottom: 0 }]}>{label}</Text>
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
        style={[
          s.selectField,
          { backgroundColor: bg, borderColor: t.border, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Text style={[s.selectFieldTxt, { color: value ? t.text : t.faint }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={t.faint} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  selectFieldTxt: { fontSize: 14, flex: 1 },
});
