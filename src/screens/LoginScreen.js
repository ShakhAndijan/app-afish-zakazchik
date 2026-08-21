import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  googleLogin,
  loginCustomer,
  requestLoginOtp,
  verifyLoginOtp,
  requestResetPasswordOtp,
  verifyResetPasswordOtp,
  requestEmailLoginOtp,
  verifyEmailLoginOtp,
} from '../api/auth';
import { saveToken, saveRefreshToken, saveActorType } from '../utils/token';
import PhoneStep from './steps/PhoneStep';
import ForgotPasswordStep from './steps/ForgotPasswordStep';
import CodeStep from './steps/CodeStep';
import NewPasswordStep from './steps/NewPasswordStep';
import EmailStep from './steps/EmailStep';
import CompleteProfileStep from './steps/CompleteProfileStep';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ onBack, onLoginSuccess }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotDevCode, setForgotDevCode] = useState('');
  const [forgotResendLoading, setForgotResendLoading] = useState(false);
  const [forgotCode, setForgotCode] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [actorType] = useState('customer');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [emailLoginEmail, setEmailLoginEmail] = useState('');
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailDevCode, setEmailDevCode] = useState('');
  const [emailResendLoading, setEmailResendLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailVerifyError, setEmailVerifyError] = useState('');

  // ── Telefon + OTP (login va register birlashgan oqimi) ──
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState('');

  const finishLogin = async (data) => {
    if (data?.access_token) await saveToken(data.access_token);
    if (data?.refresh_token) await saveRefreshToken(data.refresh_token);
    await saveActorType(actorType);
    (onLoginSuccess ?? onBack)(actorType);
  };

  const handleRequestOtp = async () => {
    try {
      setOtpLoading(true);
      setOtpError('');
      const fullPhone = '+998' + phone.replace(/\D/g, '');
      const data = await requestLoginOtp(fullPhone);
      setDevCode(data?.dev_code || '');
      setStep('code');
    } catch (e) {
      setOtpError(e.message || t('login.errors.sendCodeFailed'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    try {
      setVerifyLoading(true);
      setVerifyError('');
      const fullPhone = '+998' + phone.replace(/\D/g, '');
      const data = await verifyLoginOtp(fullPhone, code);
      if (data?.access_token) {
        await finishLogin(data);
      } else {
        setOtpCode(code);
        setCompleteError('');
        setStep('completeProfile');
      }
    } catch (e) {
      setVerifyError(e.message || t('login.errors.loginFailed'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCompleteProfile = async (fields) => {
    try {
      setCompleteLoading(true);
      setCompleteError('');
      const fullPhone = '+998' + phone.replace(/\D/g, '');
      const data = await verifyLoginOtp(fullPhone, otpCode, fields);
      await finishLogin(data);
    } catch (e) {
      setCompleteError(e.message || t('login.registerStep.errors.finishFailed'));
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      const fullPhone = '+998' + phone.replace(/\D/g, '');
      const data = await loginCustomer(fullPhone, password);
      await finishLogin(data);
    } catch (e) {
      setLoginError(e.message || t('login.errors.loginFailed'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    try {
      setForgotLoading(true);
      setForgotError('');
      const fullPhone = '+998' + forgotPhone.replace(/\D/g, '');
      const data = await requestResetPasswordOtp(fullPhone);
      setForgotDevCode(data?.dev_code || '');
      setStep('forgotCode');
    } catch (e) {
      setForgotError(e.message || t('login.errors.sendCodeFailed'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResend = async () => {
    try {
      setForgotResendLoading(true);
      const fullPhone = '+998' + forgotPhone.replace(/\D/g, '');
      const data = await requestResetPasswordOtp(fullPhone);
      setForgotDevCode(data?.dev_code || '');
    } catch (e) {
      Alert.alert(t('common.errorTitle'), e.message || t('login.errors.sendCodeFailed'));
    } finally {
      setForgotResendLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (newPassword) => {
    try {
      setResetLoading(true);
      setResetError('');
      const fullPhone = '+998' + forgotPhone.replace(/\D/g, '');
      const data = await verifyResetPasswordOtp(
        fullPhone,
        forgotCode,
        newPassword
      );
      setStep('phone');
      return data;
    } catch (e) {
      setResetError(e.message || t('login.errors.savePasswordFailed'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { token, refreshToken } = await googleLogin(actorType);
      await finishLogin({ access_token: token, refresh_token: refreshToken });
    } catch (e) {
      if (e.message !== 'cancelled') {
        Alert.alert(t('common.errorTitle'), e.message || t('login.errors.googleFailed'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailOtpRequest = async (email) => {
    try {
      setEmailOtpLoading(true);
      setEmailOtpError('');
      setEmailLoginEmail(email);
      const data = await requestEmailLoginOtp(email);
      setEmailDevCode(data?.dev_code || '');
      setStep('emailCode');
    } catch (e) {
      setEmailOtpError(e.message || t('login.errors.sendCodeFailed'));
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleEmailResend = async () => {
    try {
      setEmailResendLoading(true);
      const data = await requestEmailLoginOtp(emailLoginEmail);
      setEmailDevCode(data?.dev_code || '');
    } catch (e) {
      Alert.alert(t('common.errorTitle'), e.message || t('login.errors.sendCodeFailed'));
    } finally {
      setEmailResendLoading(false);
    }
  };

  const handleEmailVerify = async (code) => {
    try {
      setEmailVerifyLoading(true);
      setEmailVerifyError('');
      const data = await verifyEmailLoginOtp(emailLoginEmail, code);
      await finishLogin(data);
    } catch (e) {
      setEmailVerifyError(e.message || t('login.errors.loginFailed'));
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const steps = {
    phone: (
      <PhoneStep
        mode="otp"
        phone={phone}
        onChange={(v) => {
          setPhone(v);
          setOtpError('');
        }}
        onRequestOtp={handleRequestOtp}
        loginLoading={otpLoading}
        error={otpError}
        onBack={onBack}
        onGoogle={handleGoogle}
        googleLoading={googleLoading}
        onEmail={() => setStep('email')}
        actorType={actorType}
      />
    ),
    code: (
      <CodeStep
        phone={phone}
        devCode={devCode}
        onBack={() => setStep('phone')}
        onConfirm={handleVerifyOtp}
        confirmLoading={verifyLoading}
        error={verifyError}
        onResend={handleRequestOtp}
        resendLoading={otpLoading}
        onAltLogin={() => setStep('password')}
      />
    ),
    password: (
      <PhoneStep
        mode="password"
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
        onBack={() => setStep('code')}
        onGoogle={handleGoogle}
        googleLoading={googleLoading}
        onEmail={() => setStep('email')}
        actorType={actorType}
      />
    ),
    completeProfile: (
      <CompleteProfileStep
        onBack={() => setStep('code')}
        onSubmit={handleCompleteProfile}
        loading={completeLoading}
        error={completeError}
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
        onConfirm={(code) => {
          setForgotCode(code);
          setResetError('');
          setStep('newPassword');
        }}
        onResend={handleForgotResend}
        resendLoading={forgotResendLoading}
      />
    ),
    newPassword: (
      <NewPasswordStep
        onBack={() => setStep('forgotCode')}
        onSubmit={handleResetPasswordSubmit}
        loading={resetLoading}
        error={resetError}
      />
    ),
    email: (
      <EmailStep
        onBack={() => setStep('phone')}
        onSubmit={handleEmailOtpRequest}
        loading={emailOtpLoading}
        error={emailOtpError}
      />
    ),
    emailCode: (
      <CodeStep
        email={emailLoginEmail}
        devCode={emailDevCode}
        onBack={() => setStep('email')}
        onConfirm={handleEmailVerify}
        confirmLoading={emailVerifyLoading}
        error={emailVerifyError}
        onResend={handleEmailResend}
        resendLoading={emailResendLoading}
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
