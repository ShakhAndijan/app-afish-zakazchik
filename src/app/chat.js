import { useLocalSearchParams } from 'expo-router';
import RequestChatScreen from '../screens/RequestChatScreen';
import useGoBack from '../navigation/useGoBack';

export default function ChatRoute() {
  const { orderId, workerId, workerName, workerPhoto } = useLocalSearchParams();
  return (
    <RequestChatScreen
      orderId={Number(orderId)}
      workerId={workerId ? Number(workerId) : null}
      workerName={workerName || null}
      workerPhoto={workerPhoto || null}
      onBack={useGoBack()}
    />
  );
}
