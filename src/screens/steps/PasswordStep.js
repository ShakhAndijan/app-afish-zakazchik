import {
  View, Text, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
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

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
            </View>
            <View style={styles.securityTextWrap}>
              <Text style={styles.securityTitle}>{t('login.passwordStep.securityTitle')}</Text>
              <Text style={styles.securityText}>{t('login.passwordStep.securityText')}</Text>
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryBtn
            label={t('login.phoneStep.loginCta')}
            disabled={!ready}
            icon={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
            onPress={onLogin}
          />

          <Text style={styles.note}>{t('login.passwordStep.note')}</Text>

          <View style={styles.altRow}>
            <Text style={styles.altHint}>{t('login.passwordStep.altCodeHint')}</Text>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.altLink}>{t('login.passwordStep.altCodeLink')}</Text>
            </TouchableOpacity>
          </View>
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
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(47,163,122,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextWrap: { flex: 1, gap: 2 },
  securityTitle: {
    color: COLORS.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
  securityText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
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
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  altHint: {
    color: COLORS.muted,
    fontSize: 13,
  },
  altLink: {
    color: COLORS.orange,
    fontSize: 13,
    fontWeight: '700',
  },
});
