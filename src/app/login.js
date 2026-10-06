import { useAuth } from '../context/AuthContext';
import useGoBack from '../navigation/useGoBack';
import LoginScreen from '../screens/LoginScreen';

// Muvaffaqiyatli kirishdan keyin bosh sahifaga o'tishni AuthRedirect (_layout.js) bajaradi.
export default function LoginRoute() {
  const { signIn } = useAuth();
  const goBack = useGoBack();
  return <LoginScreen onBack={goBack} onLoginSuccess={signIn} />;
}
