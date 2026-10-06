import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

// Saqlangan sessiya bor, lekin biometrik tekshiruv o'tmaganda ko'rsatiladi:
// qayta urinish yoki boshqa hisobga o'tish.
export default function BiometricLockScreen({ unlocking, onRetry, onUseOtherAccount }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="fingerprint" size={44} color={COLORS.orange} />
        </View>
        <Text style={styles.title}>{t('app.lock.title')}</Text>
        <Text style={styles.subtitle}>{t('app.lock.subtitle')}</Text>
        <TouchableOpacity
          onPress={onRetry}
          disabled={unlocking}
          activeOpacity={0.85}
          style={[styles.retryBtn, { opacity: unlocking ? 0.7 : 1 }]}
        >
          <Text style={styles.retryTxt}>{unlocking ? t('app.lock.checking') : t('app.lock.retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onUseOtherAccount} activeOpacity={0.7} style={{ marginTop: 4 }}>
          <Text style={styles.otherTxt}>{t('app.lock.useOtherAccount')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 18,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(232,122,69,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.muted, fontSize: 13.5, textAlign: 'center', lineHeight: 19 },
  retryBtn: {
    marginTop: 10,
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  retryTxt: { color: '#fff', fontSize: 14.5, fontWeight: '700' },
  otherTxt: { color: COLORS.faint, fontSize: 12.5, fontWeight: '600' },
});
