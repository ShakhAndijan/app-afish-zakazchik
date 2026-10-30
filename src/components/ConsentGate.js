import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  useAcceptConsent,
  useConsentStatus,
  useConsentVersion,
  useLegalIndex,
} from '../queries/legal';
import { getErrorMessage } from '../utils/errors';
import ConsentCheck from './login/ConsentCheck';
import DocumentScreen from '../screens/DocumentScreen';

// Shaxsiy ma'lumotlarga rozilik eshigi. Rozilik matni yangilangan bo'lsa yoki foydalanuvchi rozilik
// belgisisiz kirgan bo'lsa (Google, parol bilan kirish, rozilik joriy etilishidan oldingi hisoblar),
// GET /auth/consent `required: true` qaytaradi — ilova rozilik berilmaguncha yopiq turadi.
// Rad etish — chiqish. So'rov muvaffaqiyatsiz bo'lsa (tarmoq yo'q) ilova bloklanmaydi.
export default function ConsentGate() {
  const { signedIn } = useAuth();
  const status = useConsentStatus(signedIn);
  // Alohida komponent: modal yopilganda holat (jumladan rozilik belgisi) yo'qoladi, shuning uchun
  // chiqib boshqa hisob bilan kirgan foydalanuvchiga tayyor belgilangan holda o'tmaydi.
  return signedIn && status.data?.required === true ? <ConsentModal /> : null;
}

function ConsentModal() {
  const { signOut } = useAuth();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const version = useConsentVersion();
  const legalIndex = useLegalIndex();
  const accept = useAcceptConsent();
  const [checked, setChecked] = useState(false);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  const onAgree = async () => {
    setError('');
    try {
      await accept.mutateAsync(version);
    } catch (e) {
      // Matn yangilangan bo'lsa amaldagi versiyani qayta olamiz; foydalanuvchi yana bosadi.
      if (e?.code === 'consent_outdated') legalIndex.refetch();
      setError(getErrorMessage(e, tr, 'legal.gate.failed'));
    }
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      {doc ? (
        <View style={{ flex: 1, backgroundColor: t.bg }}>
          <DocumentScreen docKey={doc} onBack={() => setDoc(null)} />
        </View>
      ) : (
        <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
          <View style={s.body}>
            <View style={[s.icon, { backgroundColor: t.card, borderColor: t.border }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={36} color={t.orange} />
            </View>
            <Text style={[s.title, { color: t.text }]}>{tr('legal.gate.title')}</Text>
            <Text style={[s.text, { color: t.muted }]}>{tr('legal.gate.text')}</Text>

            <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <ConsentCheck
                checked={checked}
                onToggle={() => setChecked((v) => !v)}
                onOpenDoc={setDoc}
                colors={{ text: t.muted, link: t.text, border: t.border, active: t.orange }}
              />
            </View>

            {!!error && <Text style={s.error}>{error}</Text>}
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.primary, { backgroundColor: t.orange }, !checked && { opacity: 0.45 }]}
              disabled={!checked || accept.isPending}
              activeOpacity={0.85}
              onPress={onAgree}
            >
              {accept.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.primaryTxt}>{tr('legal.gate.agree')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.secondary} activeOpacity={0.7} onPress={signOut}>
              <Text style={[s.secondaryTxt, { color: t.muted }]}>{tr('legal.gate.decline')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 16 },
  body: { flex: 1, justifyContent: 'center', gap: 14 },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  text: { fontSize: 14.5, lineHeight: 22, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 8 },
  error: { color: '#e0473a', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  actions: { gap: 6 },
  primary: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondary: { height: 46, alignItems: 'center', justifyContent: 'center' },
  secondaryTxt: { fontWeight: '700', fontSize: 14.5 },
});
