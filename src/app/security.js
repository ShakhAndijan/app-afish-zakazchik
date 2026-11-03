import ProfileSecurityScreen from '../screens/ProfileSecurityScreen';
import useGoBack from '../navigation/useGoBack';

export default function SecurityRoute() {
  return <ProfileSecurityScreen onBack={useGoBack()} />;
}
