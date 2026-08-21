import {
  View, Text, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import BackBtn from '../../components/login/BackBtn';
import InputField from '../../components/login/InputField';
import PrimaryBtn from '../../components/login/PrimaryBtn';

export default function EmailStep({ onBack, onSubmit, loading = false, error = '' }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const isReady = email.includes('@') && !loading;

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

          <View style={styles.heading}>
            <Text style={styles.title}>{t('login.emailStep.title')}</Text>
            <Text style={styles.subtitle}>{t('login.emailStep.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label={t('login.emailStep.emailLabel')}
              placeholder={t('login.emailStep.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoFocus
              icon={<Ionicons name="mail-outline" size={19} color={COLORS.faint} />}
            />
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#e0473a" />
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          )}

          <PrimaryBtn
            label={t('login.emailStep.sendCode')}
            disabled={!isReady}
            icon={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
            onPress={() => onSubmit?.(email)}
          />
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
    gap: 28,
  },
  heading: { gap: 8, marginTop: 8 },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: { color: COLORS.muted, fontSize: 14 },
  form: { gap: 13 },
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
});
