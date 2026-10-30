import { useLocalSearchParams } from 'expo-router';
import SiteFormScreen from '../screens/company/SiteFormScreen';
import useGoBack from '../navigation/useGoBack';

// Kompaniya obyekti qo'shish yoki tahrirlash (`?id=` bo'lsa — tahrirlash).
export default function SiteFormRoute() {
  const { id } = useLocalSearchParams();
  return (
    <SiteFormScreen siteId={Number(Array.isArray(id) ? id[0] : id) || null} onBack={useGoBack()} />
  );
}
