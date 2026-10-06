import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Backenddan kelmayotgan, vaqtincha namunaviy ma'lumot ekanini bildiruvchi belgi.
export default function MockBadge() {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={[s.badge, { backgroundColor: t.gold + '22', borderColor: t.gold + '55' }]}>
      <MaterialCommunityIcons name="flask-outline" size={11} color={t.gold} />
      <Text style={[s.text, { color: t.gold }]}>{tr('orderDetail.mockBadge')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: { fontSize: 10.5, fontWeight: '700' },
});
