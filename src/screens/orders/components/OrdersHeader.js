import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Yuqori panel: orqaga tugmasi va "Buyurtmalarim" sarlavhasi.
export default function OrdersHeader({ onBack }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={[s.header, { backgroundColor: t.bg }]}>
      <TouchableOpacity
        style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
      </TouchableOpacity>
      <Text style={[s.title, { color: t.text }]}>{tr('orders.headerTitle')}</Text>
      <View style={{ flex: 1 }} />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 20 },
});
