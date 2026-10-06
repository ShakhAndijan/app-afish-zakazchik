import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import useGoBack from '../navigation/useGoBack';

export default function ChangePasswordRoute() {
  return <ChangePasswordScreen onBack={useGoBack()} />;
}
