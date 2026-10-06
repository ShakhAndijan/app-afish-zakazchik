import ZakazchiNotifScreen from '../screens/ZakazchiNotifScreen';
import useGoBack from '../navigation/useGoBack';

export default function NotificationsRoute() {
  return <ZakazchiNotifScreen onBack={useGoBack()} />;
}
