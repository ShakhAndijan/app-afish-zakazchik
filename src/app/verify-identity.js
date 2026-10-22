import VerifyIdentityScreen from '../screens/VerifyIdentityScreen';
import useGoBack from '../navigation/useGoBack';

export default function VerifyIdentityRoute() {
  return <VerifyIdentityScreen onBack={useGoBack()} />;
}
