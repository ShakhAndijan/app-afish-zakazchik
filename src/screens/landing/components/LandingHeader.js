import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import BrandLogo from '../../../components/BrandLogo';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';

// Logo va "Kirish" tugmasi.
export default function LandingHeader({ onLogin }) {
  const { t } = useLanguage();

  return (
    <View style={styles.header}>
      <BrandLogo width={130} dark />
      <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8} onPress={onLogin}>
        <Feather name="log-in" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
        <Text style={styles.loginBtnTxt}>{t('app.header.login')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  loginBtnTxt: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
});
