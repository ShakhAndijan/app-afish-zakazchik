import { useQuery } from '@tanstack/react-query';
import { getArticle, getArticles } from '../api/articles';
import { useLanguage } from '../context/LanguageContext';
import { toCyrillic } from '../i18n/translit';

const STALE_MS = 10 * 60 * 1000;

// Maqolalar backendda faqat lotinda — kirill tilida sarlavha va qisqacha mazmuni shu yerda o'giriladi
// (matn ArticleBody da). Kirillda kelgan matn o'zgarmaydi.
const withCyrillic = (a) => ({ ...a, title: toCyrillic(a.title), summary: toCyrillic(a.summary) });

// Kesh kaliti til bilan: maqola matni so'rov tilida keladi, til almashsa yangisi olinadi.
export function useArticles() {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['articles', 'list', language],
    queryFn: getArticles,
    select: language === 'cr' ? (list) => list.map(withCyrillic) : undefined,
    staleTime: STALE_MS,
  });
}

export function useArticle(slug) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['articles', 'item', slug, language],
    queryFn: () => getArticle(slug),
    select: language === 'cr' ? withCyrillic : undefined,
    enabled: !!slug,
    staleTime: STALE_MS,
  });
}
