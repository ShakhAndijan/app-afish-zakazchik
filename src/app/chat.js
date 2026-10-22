import { useLocalSearchParams } from 'expo-router';
import RequestChatScreen from '../screens/RequestChatScreen';
import useGoBack from '../navigation/useGoBack';

export default function ChatRoute() {
  const { orderId } = useLocalSearchParams();
  return <RequestChatScreen orderId={Number(orderId)} onBack={useGoBack()} />;
}
