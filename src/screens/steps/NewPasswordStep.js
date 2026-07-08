import { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../constants/colors';
import BackBtn from '../../components/login/BackBtn';
import PasswordInput from '../../components/login/PasswordInput';
import PrimaryBtn from '../../components/login/PrimaryBtn';

const PASSWORD_RULES = [
  { key: 'length', label: 'Kamida 8 ta belgi', test: (pw) => pw.length >= 8 },
  { key: 'upper', label: '1 ta katta harf (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', label: '1 ta kichik harf (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'digit', label: '1 ta raqam (0-9)', test: (pw) => /\d/.test(pw) },
  { key: 'special', label: '1 ta maxsus belgi (!@#$%)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function PasswordRules({ password }) {
  return (
    <View style={styles.rulesWrap}>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <View key={rule.key} style={styles.ruleItem}>
            <Ionicons
              name={passed ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={passed ? COLORS.success : COLORS.faint}
            />
            <Text style={[styles.ruleLabel, passed && styles.ruleLabelDone]}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function NewPasswordStep({
  onBack,
  onSubmit,
  loading = false,
  error = '',
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordOk = PASSWORD_RULES.every((rule) => rule.test(newPassword));
  const matchOk = confirmPassword.length > 0 && confirmPassword === newPassword;
  const isReady = passwordOk && matchOk && !loading;

  const handleSubmit = () => {
    if (!isReady) return;
    onSubmit?.(newPassword);
  };

  return (
    <View style={styles.container}>
      <BackBtn onPress={onBack} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Yangi parol</Text>
        <Text style={styles.subtitle}>
          Hisobingiz uchun yangi parol o'rnating.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Yangi parol</Text>
        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          theme={{ isDark: true }}
          placeholder="Yangi parol yarating"
        />
        <PasswordRules password={newPassword} />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Parolni tasdiqlang</Text>
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          theme={{ isDark: true }}
          placeholder="Parolni qayta kiriting"
        />
        {!!confirmPassword && !matchOk && (
          <Text style={styles.mismatchTxt}>Parollar mos kelmadi</Text>
        )}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#e0473a" />
          <Text style={styles.errorTxt}>{error}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <PrimaryBtn
          label={loading ? '' : 'Parolni saqlash'}
          disabled={!isReady}
          onPress={handleSubmit}
          icon={
            loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={18} color={isReady ? '#fff' : '#7a6253'} />
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 18,
    gap: 22,
  },
  header: { gap: 8, alignItems: 'center' },
  logo: { width: 200, height: 110 },
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

  fieldWrap: { gap: 8 },
  fieldLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },

  rulesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: '50%',
    marginBottom: 6,
    paddingRight: 6,
  },
  ruleLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '400',
    flexShrink: 1,
  },
  ruleLabelDone: {
    color: COLORS.success,
    fontWeight: '600',
  },

  mismatchTxt: {
    color: '#e0473a',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(224,71,58,0.13)',
    borderColor: 'rgba(224,71,58,0.32)',
  },
  errorTxt: { flex: 1, fontSize: 12.5, fontWeight: '600', lineHeight: 17, color: '#e0473a' },

  footer: { marginTop: 'auto', paddingBottom: 8 },
});
