import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { appAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import SuccessModal from '../components/SuccessModal';
import { getCustomerMe } from '../api/user';
import { requestEmailOtp, verifyEmailOtp } from '../api/account';
import { getErrorMessage } from '../utils/errors';
import useBottomInset from '../hooks/useBottomInset';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Email qo'shish/tasdiqlash (saytdagi "Email manzili"): manzilga kod yuboriladi, kod kiritilsa tasdiqlanadi.
// Boshqa manzil kiritilsa, hisobdagi email o'shanga almashadi.
export default function VerifyEmailScreen({ onBack }) {
  const bottomInset = useBottomInset();
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const queryClient = useQueryClient();
  const { refreshUser } = useUser();
  const me = useQuery({
    queryKey: ['customer', 'me'],
    queryFn: getCustomerMe,
    staleTime: 30 * 1000,
  });

  const current = me.data?.email ?? null;
  const verified = !!current && me.data?.is_email_verified !== false;

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const value = email ?? current ?? '';

  const fail = (e, key) => appAlert(tr('common.errorTitle'), getErrorMessage(e, tr, key));

  const sendCode = async () => {
    const addr = value.trim();
    if (!EMAIL_RE.test(addr)) {
      appAlert(tr('common.errorTitle'), tr('account.email.invalid'));
      return;
    }
    setBusy(true);
    try {
      await requestEmailOtp(addr);
      setEmail(addr);
      setCode('');
      setStep('code');
    } catch (e) {
      fail(e, 'account.email.sendFailed');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await verifyEmailOtp(value.trim(), code.trim());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer', 'me'] }),
        refreshUser(),
      ]);
      setDone(true);
    } catch (e) {
      fail(e, 'account.email.confirmFailed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: t.text }]}>{tr('account.email.title')}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32 + bottomInset,
            gap: 14,
          }}
        >
          {!!current && (
            <View
              style={[
                s.status,
                {
                  borderColor: (verified ? t.green : t.gold) + '66',
                  backgroundColor: (verified ? t.green : t.gold) + '14',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={verified ? 'check-circle-outline' : 'alert-circle-outline'}
                size={20}
                color={verified ? t.green : t.gold}
              />
              <Text style={[s.statusText, { color: t.text }]}>
                {tr(verified ? 'account.email.verified' : 'account.email.unverified', {
                  email: current,
                })}
              </Text>
            </View>
          )}

          {step === 'email' ? (
            <>
              <Text style={[s.hint, { color: t.muted }]}>{tr('account.email.hint')}</Text>
              <TextInput
                style={[
                  s.input,
                  { backgroundColor: t.inputBg, borderColor: t.border, color: t.text },
                ]}
                value={value}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={t.faint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              <PrimaryButton
                t={t}
                busy={busy}
                label={tr('account.email.sendCode')}
                onPress={sendCode}
              />
            </>
          ) : (
            <>
              <Text style={[s.hint, { color: t.muted }]}>
                {tr('account.email.codeHint', { email: value })}
              </Text>
              <TextInput
                style={[
                  s.input,
                  s.codeInput,
                  { backgroundColor: t.inputBg, borderColor: t.border, color: t.text },
                ]}
                value={code}
                onChangeText={(x) => setCode(x.replace(/\D/g, '').slice(0, 10))}
                placeholder="000000"
                placeholderTextColor={t.faint}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={10}
              />
              <PrimaryButton
                t={t}
                busy={busy}
                disabled={code.length < 4}
                label={tr('account.email.confirm')}
                onPress={confirm}
              />
              <TouchableOpacity
                onPress={() => setStep('email')}
                style={{ alignSelf: 'center', padding: 8 }}
              >
                <Text style={{ color: t.orange, fontWeight: '700', fontSize: 13.5 }}>
                  {tr('account.email.changeAddress')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={done}
        onClose={() => {
          setDone(false);
          onBack();
        }}
        t={t}
        message={tr('account.email.done')}
      />
    </SafeAreaView>
  );
}

function PrimaryButton({ t, busy, disabled, label, onPress }) {
  const off = busy || disabled;
  return (
    <TouchableOpacity
      style={[s.primary, { backgroundColor: t.orange, opacity: off ? 0.5 : 1 }]}
      activeOpacity={0.85}
      disabled={off}
      onPress={onPress}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>{label}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 20 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  statusText: { flex: 1, fontSize: 13.5, fontWeight: '600' },
  hint: { fontSize: 13, lineHeight: 19 },
  input: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  codeInput: { fontSize: 22, letterSpacing: 6, textAlign: 'center', fontWeight: '700' },
  primary: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
