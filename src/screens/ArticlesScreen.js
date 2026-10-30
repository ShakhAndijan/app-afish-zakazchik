import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import { useArticles } from '../queries/articles';
import { formatDate } from '../utils/format';
import useBottomInset from '../hooks/useBottomInset';

// "Foydali maqolalar" (saytdagi /maqolalar): sarlavha, qisqa tavsif va matnli kartochkalar — rasmsiz,
// sayt bilan bir xil. Maqolaga o'tish `onOpen(slug)` orqali.
export default function ArticlesScreen({ onBack, onOpen }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const q = useArticles();
  const items = q.data ?? [];

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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + bottomInset, gap: 14 }}
      >
        <Text style={[s.title, { color: t.text }]}>{tr('articles.title')}</Text>
        <Text style={[s.intro, { color: t.muted }]}>{tr('articles.intro')}</Text>

        {q.isPending && (
          <View style={{ alignItems: 'center', paddingVertical: 30 }}>
            <AppLoader size={100} />
          </View>
        )}
        {q.isError && !q.data && <SectionError onRetry={q.refetch} />}
        {q.isSuccess && items.length === 0 && (
          <Text style={{ color: t.muted, textAlign: 'center', paddingVertical: 24 }}>
            {tr('articles.empty')}
          </Text>
        )}

        {items.map((a) => (
          <TouchableOpacity
            key={a.slug}
            activeOpacity={0.8}
            onPress={() => onOpen(a.slug)}
            style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <Text style={[s.cardTitle, { color: t.text }]}>{a.title}</Text>
            {!!a.summary && <Text style={[s.summary, { color: t.muted }]}>{a.summary}</Text>}
            <Text style={[s.meta, { color: t.faint }]}>
              {[
                a.publishedAt && formatDate(a.publishedAt),
                a.readingMinutes > 0 && tr('articles.readMinutes', { n: a.readingMinutes }),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  intro: { fontSize: 15.5, lineHeight: 24, marginBottom: 6 },
  card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 8 },
  cardTitle: { fontSize: 18, lineHeight: 25, fontWeight: '800' },
  summary: { fontSize: 14.5, lineHeight: 22 },
  meta: { fontSize: 13.5, marginTop: 2 },
});
