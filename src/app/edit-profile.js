import EditProfileScreen from '../screens/EditProfileScreen';
import useGoBack from '../navigation/useGoBack';

export default function EditProfileRoute() {
  return <EditProfileScreen onBack={useGoBack()} />;
}
