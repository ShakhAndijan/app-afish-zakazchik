import { View, Text, Image, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';

import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import BackBtn from '../../components/login/BackBtn';
import PrimaryBtn from '../../components/login/PrimaryBtn';
import PasswordInput from '../../components/login/PasswordInput';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { key: 'length', test: (pw) => pw.length >= 8 },
  { key: 'upper', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', test: (pw) => /[a-z]/.test(pw) },
  { key: 'digit', test: (pw) => /\d/.test(pw) },
  { key: 'special', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function PasswordRules({ password, t }) {
  return (
    <View style={styles.rulesWrap}>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <Text
            key={rule.key}
            style={[styles.ruleTxt, passed && styles.ruleTxtPassed]}
          >
            {t(`login.newPasswordStep.rules.${rule.key}`)}
          </Text>
        );
      })}
    </View>
  );
}

export default function CompleteProfileStep({ onBack, onSubmit, loading, error }) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailOk = EMAIL_REGEX.test(email.trim());
  const passwordOk = PASSWORD_RULES.every((rule) => rule.test(password));
  const ready = firstName.trim() && lastName.trim() && emailOk && passwordOk && !loading;

  return (
    <View style={styles.container}>
      <BackBtn onPress={onBack} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('login.registerStep.info.title')}</Text>
        <Text style={styles.subtitle}>{t('login.registerStep.info.subtitle')}</Text>
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder={t('login.registerStep.info.firstName')}
          placeholderTextColor={COLORS.faint}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder={t('login.registerStep.info.lastName')}
          placeholderTextColor={COLORS.faint}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('login.registerStep.info.emailPlaceholder')}
        placeholderTextColor={COLORS.faint}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <PasswordInput
        value={password}
        onChangeText={setPassword}
        theme={{ isDark: true }}
        placeholder={t('login.registerStep.info.passwordPlaceholder')}
      />
      <PasswordRules password={password} t={t} />

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryBtn
        label={t('login.registerStep.info.cta')}
        disabled={!ready}
        icon={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
        onPress={() =>
          onSubmit?.({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            password,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 18,
    gap: 16,
  },
  header: { gap: 10, marginTop: 8, alignItems: 'center', marginBottom: 4 },
  logo: { width: 180, height: 100 },
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
  },
  row: { flexDirection: 'row', gap: 10 },
  rowInput: { flex: 1 },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 15,
  },
  rulesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -4 },
  ruleTxt: {
    fontSize: 11.5,
    color: COLORS.faint,
    fontWeight: '600',
  },
  ruleTxtPassed: { color: COLORS.success },
  errorText: {
    color: '#e0473a',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
