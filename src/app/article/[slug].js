import { useLocalSearchParams } from 'expo-router';
import ArticleScreen from '../../screens/ArticleScreen';
import useGoBack from '../../navigation/useGoBack';

// Maqola sahifasi; havola `/article/{slug}` ilovada ochiladi.
export default function ArticleRoute() {
  const { slug } = useLocalSearchParams();
  return <ArticleScreen slug={Array.isArray(slug) ? slug[0] : slug} onBack={useGoBack()} />;
}
