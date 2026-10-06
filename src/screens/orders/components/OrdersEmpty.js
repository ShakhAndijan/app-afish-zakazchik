import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function OrdersEmpty() {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={s.empty}>
      <View style={[s.icon, { backgroundColor: t.card, borderColor: t.border }]}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={40} color={t.faint} />
      </View>
      <Text style={[s.title, { color: t.text }]}>{tr('orders.emptyTitle')}</Text>
      <Text style={[s.sub, { color: t.muted }]}>{tr('orders.emptySubtitle')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 40 },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontWeight: '800', fontSize: 15.5 },
  sub: { fontWeight: '600', fontSize: 12.5, marginTop: 6, textAlign: 'center' },
});
