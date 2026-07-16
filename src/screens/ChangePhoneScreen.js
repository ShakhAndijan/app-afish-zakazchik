import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import PhoneInput from '../components/login/PhoneInput';
import { requestChangePhoneOtp, verifyChangePhoneOtp } from '../api/user';
import SuccessModal from '../components/SuccessModal';

const formatPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return s;
};

/* ── Themed 6-cell OTP input (same idea as login's OtpInput, adapted to
   light/dark via `t` since this screen lives inside the themed profile area) ── */
function OtpCells({ value, onChange, t, length = 6 }) {
  const refs = useRef([]);

  const handleChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const chars = Array.from({ length }, (_, i) => value[i] || '');
    chars[index] = digit;
    onChange(chars.join(''));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={s.otpRow}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <TextInput
            key={i}
            ref={(el) => (refs.current[i] = el)}
            style={[
              s.otpCell,
              {
                backgroundColor: t.inputBg,
                borderColor: filled ? t.orange : t.border,
                color: t.text,
              },
              filled && { backgroundColor: t.orange + '18' },
            ]}
            value={value[i] || ''}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        );
      })}
    </View>
  );
}

export default function ChangePhoneScreen({ currentPhone, onBack, onChanged }) {
  const { theme: t } = useTheme();
  const [step, setStep] = useState('input');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (step !== 'otp' || timer === 0) return;
    const id = setTimeout(() => setTimer((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  const isPhoneReady = phone.length === 9 && !sending;
  const isCodeReady = code.length === 6 && !verifying;

  const fullPhone = () => '+998' + phone.replace(/\D/g, '');

  const handleSendCode = async () => {
    if (!isPhoneReady) return;
    setSendError('');
    setSending(true);
    try {
      const data = await requestChangePhoneOtp(fullPhone());
      setDevCode(data?.dev_code || '');
      setCode('');
      setTimer(60);
      setStep('otp');
    } catch (e) {
      setSendError(e.message || 'Kod yuborishda xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const data = await requestChangePhoneOtp(fullPhone());
      setDevCode(data?.dev_code || '');
      setCode('');
      setTimer(60);
    } catch (e) {
      Alert.alert('Xato', e.message || 'Kod yuborishda xatolik yuz berdi');
    } finally {
      setResending(false);
    }
  };

  const handleConfirm = async () => {
    if (!isCodeReady) return;
    setConfirmError('');
    setVerifying(true);
    try {
      await verifyChangePhoneOtp(fullPhone(), code);
      setShowSuccess(true);
    } catch (e) {
      setConfirmError(e.message || 'Kod noto\'g\'ri, qayta urinib ko\'ring');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <View style={[s.header, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={step === 'otp' ? () => setStep('input') : onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>
          {step === 'otp' ? 'Tasdiqlash kodi' : 'Telefon raqamini almashtirish'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {step === 'input' ? (
          <>
            <View style={[s.hero, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={[s.heroIcon, { backgroundColor: t.blue + '1c' }]}>
                <MaterialCommunityIcons name="phone-check-outline" size={24} color={t.blue} />
              </View>
              <Text style={[s.heroText, { color: t.muted }]}>
                Yangi raqamga tasdiqlash kodi yuboriladi. Kodni kiritgach, tizimga shu raqam bilan kirasiz.
              </Text>
            </View>

            <View style={{ marginTop: 20, gap: 8 }}>
              <Text style={[s.fieldLabel, { color: t.muted }]}>Joriy raqam</Text>
              <View style={[s.currentRow, { backgroundColor: t.inputBg, borderColor: t.border }]}>
                <MaterialCommunityIcons name="phone-outline" size={17} color={t.faint} />
                <Text style={[s.currentText, { color: t.text }]}>{currentPhone}</Text>
              </View>
            </View>

            <View style={{ marginTop: 18, gap: 8 }}>
              <Text style={[s.fieldLabel, { color: t.muted }]}>Yangi telefon raqami</Text>
              <PhoneInput value={phone} onChangeText={setPhone} theme={t} />
              {!!sendError && (
                <Text style={[s.errorText, { color: t.red }]}>{sendError}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: isPhoneReady ? t.orange : t.orange + '55' }]}
              activeOpacity={0.85}
              onPress={handleSendCode}
              disabled={!isPhoneReady}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.submitText}>Tasdiqlash kodini yuborish</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={s.otpHero}>
              <View style={[s.heroIcon, { backgroundColor: t.green + '1c', width: 64, height: 64, borderRadius: 18 }]}>
                <MaterialCommunityIcons name="message-processing-outline" size={28} color={t.green} />
              </View>
              <Text style={[s.otpTitle, { color: t.text }]}>SMS kod yuborildi</Text>
              <Text style={[s.otpSubtitle, { color: t.muted }]}>
                <Text style={{ color: t.text, fontWeight: '700' }}>+998 {formatPhone(phone)}</Text>
                {' '}raqamiga yuborilgan 6 xonali kodni kiriting.
              </Text>
            </View>

            <OtpCells value={code} onChange={setCode} t={t} />

            {!!confirmError && (
              <Text style={[s.errorText, { textAlign: 'center', marginTop: 10, color: t.red }]}>
                {confirmError}
              </Text>
            )}

            {!!devCode && (
              <Text style={[s.devCode, { color: t.muted }]}>
                Dev kod: <Text style={{ color: t.orange, fontWeight: '700' }}>{devCode}</Text>
              </Text>
            )}

            <Text style={[s.timerText, { color: t.muted }]}>
              {timer > 0 ? (
                <>
                  Qayta yuborish{' '}
                  <Text style={{ color: t.text, fontWeight: '700' }}>
                    00:{String(timer).padStart(2, '0')}
                  </Text>
                </>
              ) : resending ? (
                <ActivityIndicator size="small" color={t.orange} />
              ) : (
                <Text style={{ color: t.orange, fontWeight: '700' }} onPress={handleResend}>
                  Kodni qayta yuborish
                </Text>
              )}
            </Text>

            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: isCodeReady ? t.orange : t.orange + '55', marginTop: 8 }]}
              activeOpacity={0.85}
              onPress={handleConfirm}
              disabled={!isCodeReady}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.submitText}>Tasdiqlash</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          if (onChanged) onChanged(phone);
          else onBack();
        }}
        t={t}
        message="Telefon raqamingiz muvaffaqiyatli yangilandi."
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontWeight: '700', fontSize: 19, flexShrink: 1 },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '500' },

  fieldLabel: { fontSize: 13, fontWeight: '600' },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  currentText: { fontSize: 14.5, fontWeight: '600' },
  errorText: { fontSize: 12, fontWeight: '600', marginTop: 1 },

  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  otpHero: { alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 6 },
  otpTitle: { fontSize: 17, fontWeight: '800' },
  otpSubtitle: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 300 },

  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginTop: 22 },
  otpCell: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  timerText: { fontSize: 13, textAlign: 'center', marginTop: 16 },
  devCode: { fontSize: 13, textAlign: 'center', marginTop: 10 },
});
