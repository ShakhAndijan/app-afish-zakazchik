import { View, Text, Image, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';

import { COLORS } from '../../constants/colors';
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

export default function CodeStep({ phone, onBack, onConfirm }) {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleBack = () => { setCode(''); onBack(); };
  const resend = () => { setCode(''); setTimer(45); };

  return (
    <View style={styles.container}>
      <BackBtn onPress={handleBack} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Tasdiqlash kodi</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.phone}>+998 {formatPhone(phone)}</Text>
          {' '}raqamiga yuborilgan 5 xonali kodni kiriting.
        </Text>
      </View>

      <OtpInput value={code} onChange={setCode} />

      <Text style={styles.timerText}>
        {timer > 0 ? (
          <>Qayta yuborish <Text style={styles.timerCount}>00:{String(timer).padStart(2, '0')}</Text></>
        ) : (
          <Text style={styles.resend} onPress={resend}>Kodni qayta yuborish</Text>
        )}
      </Text>

      <PrimaryBtn
        label="Tasdiqlash"
        disabled={code.length < 5}
        onPress={onConfirm}
      />
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
  timerCount: {
    color: COLORS.white,
    fontWeight: '700',
  },
  resend: {
    color: COLORS.orange,
    fontWeight: '700',
  },
});
