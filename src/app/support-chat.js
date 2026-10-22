import SupportChatScreen from '../screens/SupportChatScreen';
import useGoBack from '../navigation/useGoBack';

export default function SupportChatRoute() {
  return <SupportChatScreen onBack={useGoBack()} />;
}
