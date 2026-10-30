import { useRouter } from 'expo-router';
import ArticlesScreen from '../screens/ArticlesScreen';
import useGoBack from '../navigation/useGoBack';
import { articleRoute } from '../navigation/params';

// Foydali maqolalar ro'yxati (mehmon ham, kirgan foydalanuvchi ham ko'radi).
export default function ArticlesRoute() {
  const router = useRouter();
  return <ArticlesScreen onBack={useGoBack()} onOpen={(slug) => router.push(articleRoute(slug))} />;
}
