import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatDeadline } from '../utils';

// "Usta bog'lana olmadi" da'vosi (saytdagi MatchComplaintNotice). `awaiting_customer` — muddatgacha
// ikki tugma: «Bog'lanmadi» / «Gaplashdik»; `disputed` — operator ko'rib chiqayotgani haqida yozuv.
export default function MatchComplaintNotice({ complaint, busy, onAnswer }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  if (!complaint) return null;

  if (complaint.status === 'disputed') {
    return (
      <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={s.head}>
          <MaterialCommunityIcons name="headset" size={20} color={t.blue} />
          <Text style={[s.body, { color: t.text }]}>{tr('orderFlow.complaint.disputed')}</Text>
        </View>
      </View>
    );
  }

  if (complaint.status !== 'awaiting_customer') return null;

  const when = formatDeadline(tr, complaint.answerDeadline);

  return (
    <View style={[s.card, { backgroundColor: t.gold + '1f', borderColor: t.gold + '55' }]}>
      <View style={s.head}>
        <MaterialCommunityIcons name="phone-missed-outline" size={20} color={t.gold} />
        <Text style={[s.title, { color: t.text }]}>{tr('orderFlow.complaint.title')}</Text>
      </View>
      <Text style={[s.body, { color: t.text }]}>{tr('orderFlow.complaint.body')}</Text>
      {!!complaint.note && (
        <Text style={[s.note, { color: t.muted }]}>
          {tr('orderFlow.complaint.note')}: {complaint.note}
        </Text>
      )}
      {!!when && (
        <Text style={[s.until, { color: t.text }]}>
          {tr('orderFlow.complaint.until', { when })}
        </Text>
      )}
      <Text style={[s.note, { color: t.muted }]}>{tr('orderFlow.complaint.noAnswer')}</Text>

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.btn, { borderColor: t.line2, borderWidth: 1.5, opacity: busy ? 0.6 : 1 }]}
          activeOpacity={0.8}
          disabled={busy}
          onPress={() => onAnswer(false)}
          accessibilityRole="button"
        >
          <Text style={[s.btnTxt, { color: t.text }]}>{tr('orderFlow.complaint.notReached')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: t.green, opacity: busy ? 0.6 : 1 }]}
          activeOpacity={0.85}
          disabled={busy}
          onPress={() => onAnswer(true)}
          accessibilityRole="button"
        >
          <Text style={[s.btnTxt, { color: '#fff' }]}>{tr('orderFlow.complaint.talked')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, fontSize: 14.5, fontWeight: '800', lineHeight: 20 },
  body: { flex: 1, fontSize: 13.5, lineHeight: 19 },
  note: { fontSize: 12.5, lineHeight: 18 },
  until: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontWeight: '700', fontSize: 14 },
});
