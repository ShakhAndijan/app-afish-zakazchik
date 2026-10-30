import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DOCUMENTS } from '../i18n/siteTexts';
import { LEGAL_KEYS } from '../api/legal';
import { useLegalDocument } from '../queries/legal';
import { formatDate } from '../utils/format';
import useBottomInset from '../hooks/useBottomInset';

// Hujjat sahifasi. Maxfiylik siyosati, shartlar, rozilik va hisobni o'chirish matnlari backenddan
// (GET /legal/{key}) olinadi — sayt bilan bir xil manba, ilovani yangilamasdan o'zgaradi. Backendga
// yetib bo'lmasa, maxfiylik va shartlar uchun ilovadagi zaxira matn ko'rsatiladi. "Biz haqimizda"
// ilovada statik.
export default function DocumentScreen({ docKey, onBack }) {
  const bottomInset = useBottomInset();
  const router = useRouter();
  const { theme: t } = useTheme();
  const { language, t: tr } = useLanguage();
  const { signedIn } = useAuth();

  const remote = LEGAL_KEYS.includes(docKey);
  const query = useLegalDocument(docKey, remote);
  const staticDoc = (DOCUMENTS[language] ?? DOCUMENTS.uz)[docKey];

  // Zaxira faqat so'rov muvaffaqiyatsiz bo'lsa: yuklanayotganda eskirgan matn ko'rsatilmaydi.
  const doc = remote
    ? (query.data ?? (query.isError ? staticDoc : null))
    : (staticDoc ?? DOCUMENTS.uz.about);
  const loading = remote && query.isPending;
  const failed = remote && !query.data && !doc;

  const meta = [];
  if (query.data) {
    meta.push(tr('legal.revision', { n: query.data.revision }));
    if (query.data.publishedAt) {
      meta.push(`${tr('legal.published')}: ${formatDate(query.data.publishedAt)}`);
    }
  } else if (doc?.updated) {
    meta.push(`${tr('support.updatedLabel')}: ${doc.updated}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
          {doc?.title ?? (remote ? tr(`legal.docs.${docKey}`) : '')}
        </Text>
      </View>

      {loading && (
        <View style={s.center}>
          <ActivityIndicator color={t.orange} />
        </View>
      )}

      {failed && (
        <View style={s.center}>
          <Text style={{ color: t.muted, fontSize: 14, textAlign: 'center' }}>
            {tr('legal.loadFailed')}
          </Text>
          <TouchableOpacity
            style={[s.retry, { backgroundColor: t.orange }]}
            onPress={() => query.refetch()}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
              {tr('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!!doc && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 48 + bottomInset,
            gap: 22,
          }}
        >
          {meta.length > 0 && (
            <Text style={{ color: t.faint, fontSize: 12.5 }}>{meta.join(' · ')}</Text>
          )}
          {!!query.data && query.data.lang !== language && (
            <Text style={{ color: t.faint, fontSize: 12.5 }}>{tr('legal.otherLang')}</Text>
          )}
          {doc.sections.map((sec, i) => (
            <View key={`${i}-${sec.h}`} style={{ gap: 8 }}>
              {!!sec.h && <Text style={[s.heading, { color: t.text }]}>{sec.h}</Text>}
              <Paragraph text={sec.p} color={t.muted} />
            </View>
          ))}

          {docKey === 'delete-account' && signedIn && (
            <TouchableOpacity
              style={[s.deleteBtn, { borderColor: t.red }]}
              activeOpacity={0.85}
              onPress={() => router.push('/delete-account')}
            >
              <Text style={{ color: t.red, fontWeight: '800', fontSize: 15 }}>
                {tr('legal.deleteAccount.button')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Backend matnida qator uzilishlari bor; "• " bilan boshlangan qator ro'yxat bandi (osilgan chekinish bilan).
function Paragraph({ text, color }) {
  return (
    <View style={{ gap: 6 }}>
      {String(text)
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line, i) =>
          line.startsWith('• ') ? (
            <View key={i} style={s.bulletRow}>
              <Text style={[s.body, { color }]}>•</Text>
              <Text style={[s.body, { color, flex: 1 }]}>{line.slice(2)}</Text>
            </View>
          ) : (
            <Text key={i} style={[s.body, { color }]}>
              {line}
            </Text>
          )
        )}
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
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '800', fontSize: 20, flex: 1 },
  heading: { fontWeight: '800', fontSize: 16 },
  body: { fontSize: 14.5, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  retry: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  deleteBtn: {
    marginTop: 4,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
