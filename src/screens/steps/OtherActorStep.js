import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import BackBtn from '../../components/login/BackBtn';
import PrimaryBtn from '../../components/login/PrimaryBtn';

export default function OtherActorStep({ onBack, onConfirm, loading, error }) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <BackBtn onPress={onBack} />

      <View style={styles.body}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons name="person" size={30} color={COLORS.white} />
          </View>
        </View>

        <Text style={styles.title}>{t('login.otherActorStep.title')}</Text>
        <Text style={styles.subtitle}>{t('login.otherActorStep.subtitle')}</Text>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryBtn
        label={t('login.otherActorStep.confirm')}
        icon={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : undefined}
        disabled={loading}
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
    gap: 20,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  iconOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  errorText: {
    color: '#e0473a',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
