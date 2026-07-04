import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { googleLogin } from '../api/auth';
import PhoneStep from './steps/PhoneStep';
import ForgotPasswordStep from './steps/ForgotPasswordStep';
import EmailStep from './steps/EmailStep';
import RegisterStep from './steps/RegisterStep';


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ onBack, onLoginSuccess }) {
  const { theme } = useTheme();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [actorType] = useState('customer');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      await googleLogin(actorType);
      setStep('done');
    } catch (e) {
      if (e.message !== 'cancelled') {
        Alert.alert('Xato', e.message || 'Google orqali kirishda xatolik');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const steps = {
    phone: (
      <PhoneStep
        phone={phone}
        onChange={setPhone}
        password={password}
        onPasswordChange={setPassword}
        onLogin={() => (onLoginSuccess ?? onBack)(actorType)}
        onForgot={() => {
          setForgotPhone(phone);
          setStep('forgot');
        }}
        onBack={onBack}
        onGoogle={handleGoogle}
        googleLoading={googleLoading}
        onEmail={() => setStep('email')}
        onRegister={() => setStep('register')}
        actorType={actorType}
      />
    ),
    forgot: (
      <ForgotPasswordStep
        phone={forgotPhone}
        onChange={setForgotPhone}
        onSubmit={() => {
          Alert.alert('Kod yuborildi', 'Tasdiqlash kodi SMS orqali yuborildi.');
          setStep('phone');
        }}
        onBack={() => setStep('phone')}
        actorType={actorType}
      />
    ),
    email: (
      <EmailStep
        onBack={() => setStep('phone')}
        onLogin={() => setStep('done')}
      />
    ),
    register: (
      <RegisterStep
        onBack={() => setStep('phone')}
        onDone={() => (onLoginSuccess ?? onBack)('customer')}
      />
    ),
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      {steps[step]}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
