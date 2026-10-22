import { useRouter } from 'expo-router';
import ListingReelsScreen from '../../screens/ListingReelsScreen';

// Pastki menyudagi "E'lonlar" tabi: e'lonlar to'g'ridan-to'g'ri Reels ko'rinishida; qidiruv va filtrlar
// tepadagi qidiruv tugmasi orqali alohida ro'yxat ekranida.
export default function AdsTab() {
  const router = useRouter();
  return <ListingReelsScreen tab onSearch={() => router.push('/listings')} />;
}
