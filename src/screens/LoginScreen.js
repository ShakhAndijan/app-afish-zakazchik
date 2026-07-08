import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { googleLogin, loginCustomer, requestResetPasswordOtp } from '../api/auth';
import { saveToken, saveRefreshToken, saveActorType } from '../utils/token';
import PhoneStep from './steps/PhoneStep';
import ForgotPasswordStep from './steps/ForgotPasswordStep';
import CodeStep from './steps/CodeStep';
import NewPasswordStep from './steps/NewPasswordStep';
import EmailStep from './steps/EmailStep';
import RegisterStep from './steps/RegisterStep';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ onBack, onLoginSuccess }) {
  const { theme } = useTheme();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotDevCode, setForgotDevCode] = useState('');
  const [forgotResendLoading, setForgotResendLoading] = useState(false);
  const [actorType] = useState('customer');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      const fullPhone = '+998' + phone.replace(/\D/g, '');
      const data = await loginCustomer(fullPhone, password);
      if (data?.access_token) await saveToken(data.access_token);
      if (data?.refresh_token) await saveRefreshToken(data.refresh_token);
      await saveActorType(actorType);
      (onLoginSuccess ?? onBack)(actorType);
    } catch (e) {
      setLoginError(e.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    try {
      setForgotLoading(true);
      setForgotError('');
      const fullPhone = '+998' + forgotPhone.replace(/\D/g, '');
      console.log('reset-password/request-otp payload:', { phone: fullPhone, actor_type: 'customer' });
      const data = await requestResetPasswordOtp(fullPhone);
      console.log('reset-password/request-otp response_data:', data);
      setForgotDevCode(data?.dev_code || '');
      setStep('forgotCode');
    } catch (e) {
      setForgotError(e.message || 'Kod yuborishda xatolik yuz berdi');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResend = async () => {
    try {
      setForgotResendLoading(true);
      const fullPhone = '+998' + forgotPhone.replace(/\D/g, '');
      console.log('reset-password/request-otp payload:', { phone: fullPhone, actor_type: 'customer' });
      const data = await requestResetPasswordOtp(fullPhone);
      console.log('reset-password/request-otp response_data:', data);
      setForgotDevCode(data?.dev_code || '');
    } catch (e) {
      Alert.alert('Xato', e.message || 'Kod yuborishda xatolik yuz berdi');
    } finally {
      setForgotResendLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { token, refreshToken } = await googleLogin(actorType);
      if (token) await saveToken(token);
      if (refreshToken) await saveRefreshToken(refreshToken);
      await saveActorType(actorType);
      (onLoginSuccess ?? onBack)(actorType);
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
        onChange={(v) => {
          setPhone(v);
          setLoginError('');
        }}
        password={password}
        onPasswordChange={(v) => {
          setPassword(v);
          setLoginError('');
        }}
        onLogin={handleLogin}
        loginLoading={loginLoading}
        error={loginError}
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
        onChange={(v) => {
          setForgotPhone(v);
          setForgotError('');
        }}
        onSubmit={handleForgotSubmit}
        loading={forgotLoading}
        error={forgotError}
        onBack={() => setStep('phone')}
        actorType={actorType}
      />
    ),
    forgotCode: (
      <CodeStep
        phone={forgotPhone}
        devCode={forgotDevCode}
        onBack={() => setStep('forgot')}
        onConfirm={() => setStep('newPassword')}
        onResend={handleForgotResend}
        resendLoading={forgotResendLoading}
      />
    ),
    newPassword: (
      <NewPasswordStep
        onBack={() => setStep('forgotCode')}
        onSubmit={() => setStep('phone')}
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bg }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {steps[step]}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
