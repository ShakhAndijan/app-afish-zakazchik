import { useLocalSearchParams } from 'expo-router';
import SupportScreen from '../screens/SupportScreen';
import useGoBack from '../navigation/useGoBack';

// Murojaatlarim / Takliflarim: `?kind=question|suggestion`.
export default function SupportRoute() {
  const { kind } = useLocalSearchParams();
  return <SupportScreen kind={Array.isArray(kind) ? kind[0] : kind} onBack={useGoBack()} />;
}
