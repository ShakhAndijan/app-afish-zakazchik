import {
  View, Text, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import BackBtn from '../../components/login/BackBtn';
import PasswordInput from '../../components/login/PasswordInput';
import PrimaryBtn from '../../components/login/PrimaryBtn';
import { detectIdentifierMode } from '../../utils/identifier';

const formatPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  let s = '';
  if (d.length > 0) s += d.slice(0, 2);
  if (d.length > 2) s += ' ' + d.slice(2, 5);
  if (d.length > 5) s += ' ' + d.slice(5, 7);
  if (d.length > 7) s += ' ' + d.slice(7, 9);
  return s;
};

export default function PasswordStep({
  identifier = '',
  password,
  onPasswordChange,
  onLogin,
  loading,
  error,
  onForgot,
  onBack,
}) {
  const { t } = useLanguage();
  const identifierMode = detectIdentifierMode(identifier);
  const identifierLabel = identifierMode === 'phone' ? `+998 ${formatPhone(identifier)}` : identifier;
  const ready = password.length >= 4 && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <BackBtn onPress={onBack} />

          <View style={styles.header}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons name="lock-closed" size={26} color={COLORS.white} />
              </View>
            </View>

            <Text style={styles.title}>{t('login.passwordStep.title')}</Text>
            <Text style={styles.subtitle}>{t('login.passwordStep.subtitle')}</Text>

            {!!identifierLabel && (
              <View style={styles.identifierPill}>
                <Ionicons
                  name={identifierMode === 'phone' ? 'call-outline' : 'mail-outline'}
                  size={14}
                  color={COLORS.muted}
                />
                <Text style={styles.identifierTxt}>{identifierLabel}</Text>
              </View>
            )}
          </View>

          <View style={styles.form}>
            <PasswordInput
              value={password}
              onChangeText={onPasswordChange}
              theme={{ isDark: true }}
              placeholder={t('login.phoneStep.passwordLabel')}
            />
            <Text style={styles.forgot} onPress={onForgot}>
              {t('login.phoneStep.forgotPassword')}
            </Text>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryBtn
            label={t('login.phoneStep.loginCta')}
            disabled={!ready}
            icon={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
            onPress={onLogin}
          />

          <Text style={styles.note}>{t('login.passwordStep.note')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 18,
    gap: 22,
  },
  header: { gap: 10, marginTop: 8, alignItems: 'center' },
  iconOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(232,122,69,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  identifierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 2,
  },
  identifierTxt: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  form: { gap: 10 },
  forgot: {
    alignSelf: 'flex-end',
    color: COLORS.orange,
    fontSize: 12.5,
    fontWeight: '600',
  },
  errorText: {
    color: '#e0473a',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  note: {
    color: COLORS.faint,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
