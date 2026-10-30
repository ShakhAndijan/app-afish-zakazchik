import { View, Text, ScrollView, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AppLoader from '../components/AppLoader';
import SectionError from './zakazchi-main/components/SectionError';
import ArticleBody from './articles/ArticleBody';
import { SITE_URL } from '../constants/config';
import { useArticle } from '../queries/articles';
import { formatDate } from '../utils/format';
import useBottomInset from '../hooks/useBottomInset';

// Maqola sahifasi (saytdagi /maqolalar/{slug}): sarlavha, sana va o'qish vaqti, qisqa tavsif, matn.
export default function ArticleScreen({ slug, onBack }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const q = useArticle(slug);
  const a = q.data;

  // Havola saytdagi maqola sahifasini ochadi.
  const share = () => {
    if (!a) return;
    Share.share({ message: `${a.title}\n${SITE_URL}${a.path}` }).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        {!!a && (
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={share}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color={t.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + bottomInset, gap: 14 }}
      >
        {q.isPending && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <AppLoader size={100} />
          </View>
        )}
        {q.isError && !a && q.error?.code === 'article_not_found' && (
          <Text style={{ color: t.muted, textAlign: 'center', paddingVertical: 40 }}>
            {tr('articles.notFound')}
          </Text>
        )}
        {q.isError && !a && q.error?.code !== 'article_not_found' && (
          <SectionError onRetry={q.refetch} />
        )}

        {!!a && (
          <>
            <Text style={[s.title, { color: t.text }]}>{a.title}</Text>
            <Text style={{ color: t.faint, fontSize: 14 }}>
              {[
                a.publishedAt && formatDate(a.publishedAt),
                a.readingMinutes > 0 && tr('articles.readMinutes', { n: a.readingMinutes }),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {!!a.summary && (
              <Text style={{ color: t.muted, fontSize: 16.5, lineHeight: 26 }}>{a.summary}</Text>
            )}
            <ArticleBody html={a.html} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '800' },
});
