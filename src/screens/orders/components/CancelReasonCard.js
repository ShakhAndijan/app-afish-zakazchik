import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

// Bekor qilish kartasi (bekor qilingan buyurtmalarda): kim bekor qilgani (`by`) va sababi.
export default function CancelReasonCard({ meta, reason, by }) {
  const { theme: t } = useTheme();

  return (
    <View style={[s.card, { backgroundColor: meta.bg, borderColor: meta.color + '33' }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={17} color={meta.color} />
      <View style={s.body}>
        {!!by && <Text style={[s.by, { color: meta.color }]}>{by}</Text>}
        {!!reason && <Text style={[s.text, { color: t.text }]}>{reason}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: 9, borderWidth: 1, borderRadius: 20, padding: 16 },
  body: { flex: 1, gap: 4 },
  by: { fontSize: 12.5, fontWeight: '800' },
  text: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
});
