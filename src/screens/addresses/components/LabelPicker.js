import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ADDRESS_LABELS, ADDRESS_LABEL_KEYS } from '../constants';

// Manzil turini tanlash: Uy / Ish / Boshqa.
export default function LabelPicker({ value, onChange, t, tr }) {
  return (
    <View style={s.row}>
      {ADDRESS_LABEL_KEYS.map((key) => {
        const meta = ADDRESS_LABELS[key];
        const color = t[meta.color];
        const active = key === value;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.8}
            style={[
              s.chip,
              {
                borderColor: active ? color : t.border,
                backgroundColor: active ? color + '22' : 'transparent',
              },
            ]}
          >
            <MaterialCommunityIcons name={meta.icon} size={16} color={active ? color : t.muted} />
            <Text style={[s.txt, { color: active ? color : t.muted }]}>
              {tr(`addresses.labels.${key}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
  },
  txt: { fontSize: 13, fontWeight: '700' },
});
