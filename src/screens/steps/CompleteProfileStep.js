import { View, Text, Image, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';

import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import BackBtn from '../../components/login/BackBtn';
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

export default function CompleteProfileStep({ onBack, onSubmit, loading, error, identifier = '' }) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const ready = firstName.trim() && lastName.trim() && !loading;
  const identifierMode = detectIdentifierMode(identifier);
  const identifierLabel = identifierMode === 'phone' ? `+998 ${formatPhone(identifier)}` : identifier;

  return (
    <View style={styles.container}>
      <BackBtn onPress={onBack} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/afish-logo-vertical.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{t('login.registerStep.info.newBadge')}</Text>
        </View>

        <Text style={styles.title}>{t('login.registerStep.info.title')}</Text>
        <Text style={styles.subtitle}>{t('login.registerStep.info.nameSubtitle')}</Text>

        {!!identifierLabel && (
          <View style={styles.identifierPill}>
            <Text style={styles.identifierTxt}>{identifierLabel}</Text>
          </View>
        )}
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

      <Text style={styles.note}>{t('login.registerStep.info.note')}</Text>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryBtn
        label={t('login.registerStep.info.cta')}
        disabled={!ready}
        icon={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
        onPress={() => onSubmit?.(firstName.trim(), lastName.trim())}
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
  badge: {
    backgroundColor: 'rgba(232,122,69,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeTxt: {
    color: COLORS.orange,
    fontSize: 12.5,
    fontWeight: '700',
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
  },
  identifierPill: {
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
  note: {
    color: COLORS.faint,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: -6,
  },
  errorText: {
    color: '#e0473a',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
