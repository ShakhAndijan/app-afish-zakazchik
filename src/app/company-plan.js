import { useLocalSearchParams } from 'expo-router';
import PlanFormScreen from '../screens/company/PlanFormScreen';
import useGoBack from '../navigation/useGoBack';

// Doimiy xizmat rejasi qo'shish yoki tahrirlash (`?id=` bo'lsa — tahrirlash).
export default function PlanFormRoute() {
  const { id } = useLocalSearchParams();
  return (
    <PlanFormScreen planId={Number(Array.isArray(id) ? id[0] : id) || null} onBack={useGoBack()} />
  );
}
