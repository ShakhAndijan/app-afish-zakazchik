import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import useGoBack from '../navigation/useGoBack';

export default function SettingsRoute() {
  return <ProfileSettingsScreen onBack={useGoBack()} />;
}
