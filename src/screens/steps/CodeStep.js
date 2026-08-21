import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import BackBtn from '../../components/login/BackBtn';
import OtpInput from '../../components/login/OtpInput';
import PrimaryBtn from '../../components/login/PrimaryBtn';

const formatPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return s;
};

export default function CodeStep({
  phone,
  email,
  onBack,
  onConfirm,
  devCode,
  onResend,
  resendLoading,
  confirmLoading,
  error,
  onAltLogin,
}) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleBack = () => { setCode(''); onBack(); };
  const resend = async () => {
    setCode('');
    setTimer(60);
    if (onResend) await onResend();
  };

  return (
    <View style={styles.container}>
      <BackBtn onPress={handleBack} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('login.codeStep.title')}</Text>
        <Text style={styles.subtitle}>
          {email ? (
            <Text style={styles.phone}>{email}</Text>
          ) : (
            <Text style={styles.phone}>+998 {formatPhone(phone)}</Text>
          )}
          {' '}{email ? t('login.codeStep.subtitleEmail') : t('login.codeStep.subtitle')}
        </Text>
      </View>

      <OtpInput value={code} onChange={setCode} length={6} />

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {!!devCode && (
        <Text style={styles.devCode}>
          {t('login.codeStep.devCode')} <Text style={styles.devCodeVal}>{devCode}</Text>
        </Text>
      )}

      <Text style={styles.timerText}>
        {timer > 0 ? (
          <>{t('login.codeStep.resendIn')} <Text style={styles.timerCount}>00:{String(timer).padStart(2, '0')}</Text></>
        ) : resendLoading ? (
          <ActivityIndicator size="small" color={COLORS.orange} />
        ) : (
          <Text style={styles.resend} onPress={resend}>{t('login.codeStep.resendNow')}</Text>
        )}
      </Text>

      <PrimaryBtn
        label={t('common.confirm')}
        disabled={code.length < 6 || confirmLoading}
        icon={confirmLoading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
        onPress={() => onConfirm?.(code)}
      />

      {!!onAltLogin && (
        <Text style={styles.altLogin} onPress={onAltLogin}>
          {t('login.codeStep.altLogin')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 18,
    gap: 26,
  },
  header: { gap: 12, marginTop: 8, alignItems: 'center' },
  logo: {
    width: 200,
    height: 130,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  phone: {
    color: COLORS.white,
    fontWeight: '700',
  },
  timerText: {
    color: COLORS.muted,
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: -8,
  },
  devCode: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
  },
  errorText: {
    color: '#e0473a',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: -8,
  },
  devCodeVal: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  timerCount: {
    color: COLORS.white,
    fontWeight: '700',
  },
  resend: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  altLogin: {
    color: COLORS.orange,
    fontWeight: '700',
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: -6,
  },
});
