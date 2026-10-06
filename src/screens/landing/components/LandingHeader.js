import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';

// Logo va "Kirish" tugmasi.
export default function LandingHeader({ onLogin }) {
  const { t } = useLanguage();

  return (
    <View style={styles.header}>
      <Image
        source={require('../../../../assets/afish-logo-horizontal.png')}
        style={styles.logoImg}
        resizeMode="contain"
      />
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
  logoImg: { width: 130, height: 36 },
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
