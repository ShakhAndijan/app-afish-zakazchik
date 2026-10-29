import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

// Mijoz buyurtma berishda yozgan ish tavsifi (to'liq matn). Chap tomondagi rangli chiziq va
// "Siz yozgan" belgisi uni boshqa xulosa kartalaridan ajratib turadi.
export default function DescriptionCard({ text, style }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  if (!text) return null;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }, style]}>
      <View style={[s.bar, { backgroundColor: t.orange }]} />
      <View style={s.body}>
        <View style={s.head}>
          <View style={[s.icon, { backgroundColor: t.orange + '1f' }]}>
            <MaterialCommunityIcons name="text-box-outline" size={17} color={t.orange} />
          </View>
          <Text style={[s.title, { color: t.orange }]}>{tr('orderDetail.descriptionTitle')}</Text>
          <View style={[s.tag, { backgroundColor: t.rowIconBg }]}>
            <Text style={[s.tagTxt, { color: t.muted }]}>{tr('orderDetail.descriptionBy')}</Text>
          </View>
        </View>
        <Text style={[s.text, { color: t.text }]} selectable>
          {text}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  bar: { width: 5 },
  body: { flex: 1, padding: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  tag: { marginLeft: 'auto', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  tagTxt: { fontSize: 11, fontWeight: '700' },
  text: { fontSize: 14.5, lineHeight: 22, fontWeight: '500', marginTop: 10 },
});
