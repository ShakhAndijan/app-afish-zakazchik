import { useLocalSearchParams } from 'expo-router';
import DocumentScreen from '../screens/DocumentScreen';
import useGoBack from '../navigation/useGoBack';

// Hujjatlar mehmonga ham ochiq (kirish ekranidagi "Shartlar" / "Maxfiylik siyosati" havolalari):
// `?key=about|privacy|terms`.
export default function DocumentRoute() {
  const { key } = useLocalSearchParams();
  return <DocumentScreen docKey={Array.isArray(key) ? key[0] : key} onBack={useGoBack()} />;
}
