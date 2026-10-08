import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

// Bekor qilish sababi kartasi (bekor qilingan buyurtmalarda).
export default function CancelReasonCard({ meta, reason }) {
  const { theme: t } = useTheme();

  return (
    <View style={[s.card, { backgroundColor: meta.bg, borderColor: meta.color + '33' }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={17} color={meta.color} />
      <Text style={[s.text, { color: t.text }]}>{reason}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: 9, borderWidth: 1, borderRadius: 20, padding: 16 },
  text: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
});
