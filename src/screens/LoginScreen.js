import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { appAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  googleLogin,
  loginCustomer,
  startCustomerAuth,
  verifyCustomerAuth,
  completeCustomerAuth,
  requestResetPasswordOtp,
  verifyResetPasswordOtp,
} from '../api/auth';
import { acceptConsent } from '../api/legal';
import { useConsentVersion, useLegalIndex } from '../queries/legal';
import { saveSession, saveActorType } from '../utils/token';
import { buildIdentifier } from '../utils/identifier';
import PhoneStep from './steps/PhoneStep';
import PasswordStep from './steps/PasswordStep';
import ForgotPasswordStep from './steps/ForgotPasswordStep';
import CodeStep from './steps/CodeStep';
import NewPasswordStep from './steps/NewPasswordStep';
import CompleteProfileStep from './steps/CompleteProfileStep';
import { devLog } from '../utils/log';
import { getErrorMessage } from '../utils/errors';

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

  // ── Telefon + OTP (login va register birlashgan oqimi: start → verify → complete) ──
  const [identifier, setIdentifier] = useState('');
  // Kirish usuli: telefon yoki qo'lda yoziladigan email.
  const [identifierMode, setIdentifierMode] = useState('phone');
  const [ticket, setTicket] = useState('');
  const [suggestedName, setSuggestedName] = useState({ firstName: '', lastName: '' });
  // Shaxsiy ma'lumotlarga rozilik belgisi (birinchi qadamda qo'yiladi, keyingi qadamlarda versiya bilan yuboriladi).
  const [consent, setConsent] = useState(false);
  const legalIndex = useLegalIndex();
  const consentVersion = useConsentVersion();
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpChannel, setOtpChannel] = useState('sms');
  const [otpError, setOtpError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState('');

  const finishLogin = async (data, { recordConsent = false } = {}) => {
    if (data?.access_token) {
      await saveSession({ accessToken: data.access_token, refreshToken: data.refresh_token });
    }
    // Google (mobil oqim) rozilikni o'zi qabul qilmaydi: belgi kirishdan oldin qo'yilgan, shuni shu yerda qayd etamiz.
    if (recordConsent) await acceptConsent(consentVersion).catch(() => {});
    await saveActorType(actorType);
    (onLoginSuccess ?? onBack)(actorType);
  };

  const handleRequestOtp = async (channel = 'sms') => {
    try {
      setOtpChannel(channel);
      setOtpLoading(true);
      setOtpError('');
      setVerifyError('');
      const data = await startCustomerAuth(buildIdentifier(identifier, identifierMode), channel);
      setDevCode(data?.dev_code || '');
      setStep('code');
    } catch (e) {
      setOtpError(getErrorMessage(e, t, 'login.errors.sendCodeFailed'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    try {
      setVerifyLoading(true);
      setVerifyError('');
      const data = await verifyCustomerAuth(
        buildIdentifier(identifier, identifierMode),
        code,
        consentVersion
      );
      devLog('[login] verify status:', data?.status);
      if (data?.access_token) {
        await finishLogin(data);
      } else if (data?.status === 'needs_name' || data?.ticket) {
        // Yangi hisob: ism-familiya va shaxsiy ma'lumotlarga rozilik belgisi shu qadamda olinadi.
        // Ism boshqa hisobdan (masalan usta sifatida avval ro'yxatdan o'tgan bo'lsa) ma'lum bo'lsa,
        // maydonlar tayyor to'ldirilgan holda chiqadi — rozilikni esa foydalanuvchi o'zi belgilashi shart.
        setTicket(data?.ticket || '');
        setSuggestedName({
          firstName: data?.suggested_first_name || '',
          lastName: data?.suggested_last_name || '',
        });
        setCompleteError('');
        setStep('completeProfile');
      } else {
        setVerifyError(t('login.errors.loginFailed'));
      }
    } catch (e) {
      setVerifyError(getErrorMessage(e, t, 'login.errors.loginFailed'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCompleteProfile = async (firstName, lastName) => {
    try {
      setCompleteLoading(true);
      setCompleteError('');
      const data = await completeCustomerAuth(ticket, firstName, lastName, consentVersion);
      await finishLogin(data);
    } catch (e) {
      // Rozilik matni yangilangan bo'lsa, amaldagi versiyani qayta olamiz va foydalanuvchi qayta urinadi.
      if (e?.code === 'consent_outdated') legalIndex.refetch();
      setCompleteError(getErrorMessage(e, t, 'login.registerStep.errors.finishFailed'));
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      const fullPhone = '+998' + phone.replace(/\D/g, '');
      const data = await loginCustomer(fullPhone, password, consentVersion);
      await finishLogin(data);
    } catch (e) {
      setLoginError(getErrorMessage(e, t, 'login.errors.loginFailed'));
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
      setForgotError(getErrorMessage(e, t, 'login.errors.sendCodeFailed'));
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
      appAlert(t('common.errorTitle'), getErrorMessage(e, t, 'login.errors.sendCodeFailed'));
    } finally {
      setForgotResendLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (newPassword) => {
    try {
      setResetLoading(true);
      setResetError('');
      const fullPhone = '+998' + forgotPhone.replace(/\D/g, '');
      const data = await verifyResetPasswordOtp(fullPhone, forgotCode, newPassword);
      setStep('phone');
      return data;
    } catch (e) {
      setResetError(getErrorMessage(e, t, 'login.errors.savePasswordFailed'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { token, refreshToken } = await googleLogin(actorType);
      await finishLogin(
        { access_token: token, refresh_token: refreshToken },
        { recordConsent: true }
      );
    } catch (e) {
      if (e.message !== 'cancelled') {
        appAlert(t('common.errorTitle'), getErrorMessage(e, t, 'login.errors.googleFailed'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const steps = {
    phone: (
      <PhoneStep
        identifier={identifier}
        mode={identifierMode}
        onModeChange={(m) => {
          setIdentifierMode(m);
          setIdentifier('');
          setOtpError('');
        }}
        onIdentifierChange={(v) => {
          setIdentifier(v);
          setOtpError('');
        }}
        onRequestOtp={handleRequestOtp}
        loginLoading={otpLoading && otpChannel === 'sms'}
        telegramLoading={otpLoading && otpChannel === 'telegram'}
        error={otpError}
        onBack={onBack}
        onGoogle={handleGoogle}
        googleLoading={googleLoading}
        actorType={actorType}
        consent={consent}
        onConsentChange={setConsent}
      />
    ),
    code: (
      <CodeStep
        phone={identifierMode === 'phone' ? identifier : undefined}
        email={identifierMode === 'email' ? identifier : undefined}
        devCode={devCode}
        onBack={() => setStep('phone')}
        onConfirm={handleVerifyOtp}
        confirmLoading={verifyLoading}
        error={verifyError}
        resendError={otpError}
        onResend={() => handleRequestOtp(otpChannel)}
        resendLoading={otpLoading}
        onAltLogin={
          identifierMode === 'phone'
            ? () => {
                setPhone(identifier);
                setStep('password');
              }
            : undefined
        }
      />
    ),
    password: (
      <PasswordStep
        identifier={phone}
        password={password}
        onPasswordChange={(v) => {
          setPassword(v);
          setLoginError('');
        }}
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
        onForgot={() => {
          setForgotPhone(phone);
          setStep('forgot');
        }}
        onBack={() => setStep('code')}
      />
    ),
    completeProfile: (
      <CompleteProfileStep
        identifier={identifier}
        initialFirstName={suggestedName.firstName}
        initialLastName={suggestedName.lastName}
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
