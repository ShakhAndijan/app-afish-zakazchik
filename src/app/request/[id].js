import { useLocalSearchParams } from 'expo-router';
import RequestScreen from '../../screens/RequestScreen';
import useGoBack from '../../navigation/useGoBack';

// Ochiq buyurtmani jonli kuzatish: holat, narx kelishuvi, rad etish va boshqa ustaga yuborish.
export default function RequestRoute() {
  const { id } = useLocalSearchParams();
  return <RequestScreen orderId={Number(id)} onBack={useGoBack()} />;
}
