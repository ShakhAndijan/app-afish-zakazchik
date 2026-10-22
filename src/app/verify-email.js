import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import useGoBack from '../navigation/useGoBack';

export default function VerifyEmailRoute() {
  return <VerifyEmailScreen onBack={useGoBack()} />;
}
