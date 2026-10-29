import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatPhoneDisplay } from '../../profile/utils';

// O'zbekiston raqami bo'lsa "+998 90 123 45 67", boshqacha bo'lsa — kelganicha.
const display = (raw) => {
  const d = String(raw).replace(/\D/g, '');
  return (d.length === 12 && d.startsWith('998')) || d.length === 9 ? formatPhoneDisplay(raw) : raw;
};
const dialUrl = (raw) => `tel:${String(raw).replace(/[^\d+]/g, '')}`;

// Narx kelishilgach telefon raqamlar ikkala tomonga ochiladi (saytdagi buyurtma sahifasi kabi):
// mijoz ustaning raqamini ko'radi va qo'ng'iroq qila oladi, o'zi bergan raqamlar esa ustaga
// ko'rinishini ham shu yerda biladi. Kelishuvgacha (ACCEPTED) raqam yo'q — qulflangan matn chiqadi.
export default function ContactsCard({ order }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  const unlocked = !!order.workerPhone;
  const locked = order.rawStatus === 'accepted' && !unlocked;
  if (!unlocked && !locked) return null;

  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {locked ? (
        <View style={s.row}>
          <View style={[s.icon, { backgroundColor: t.rowIconBg }]}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={t.muted} />
          </View>
          <Text style={[s.lockedTxt, { color: t.muted }]}>{tr('orderDetail.phonesAfterDeal')}</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(dialUrl(order.workerPhone)).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel={tr('orderDetail.call')}
          >
            <View style={[s.icon, { backgroundColor: t.green + '1f' }]}>
              <MaterialCommunityIcons name="account-hard-hat-outline" size={19} color={t.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.label, { color: t.muted }]}>{tr('orderDetail.workerPhone')}</Text>
              <Text style={[s.number, { color: t.text }]}>{display(order.workerPhone)}</Text>
            </View>
            <View style={[s.call, { backgroundColor: t.green }]}>
              <MaterialCommunityIcons name="phone" size={18} color="#fff" />
            </View>
          </TouchableOpacity>

          {!!order.contactPhone && (
            <View style={[s.row, s.divider, { borderTopColor: t.border }]}>
              <View style={[s.icon, { backgroundColor: t.rowIconBg }]}>
                <MaterialCommunityIcons name="account-outline" size={19} color={t.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.label, { color: t.muted }]}>{tr('orderDetail.yourPhone')}</Text>
                <Text style={[s.number, { color: t.text }]}>{display(order.contactPhone)}</Text>
              </View>
            </View>
          )}

          {!!order.backupPhone && (
            <View style={[s.row, s.divider, { borderTopColor: t.border }]}>
              <View style={[s.icon, { backgroundColor: t.rowIconBg }]}>
                <MaterialCommunityIcons name="phone-plus-outline" size={19} color={t.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.label, { color: t.muted }]}>{tr('orderDetail.backupPhone')}</Text>
                <Text style={[s.number, { color: t.text }]}>{display(order.backupPhone)}</Text>
              </View>
            </View>
          )}

          <Text style={[s.hint, { color: t.muted }]}>{tr('orderDetail.phonesSharedHint')}</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '600' },
  number: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  call: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lockedTxt: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  hint: { fontSize: 11.5, lineHeight: 16, paddingBottom: 12 },
});
