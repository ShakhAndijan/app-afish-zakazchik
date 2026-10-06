import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';

// To'q sarg'ish reklama banneri: "Kirish" ga yo'naltiradi.
export default function PromoBanner({ onPress }) {
  const { t } = useLanguage();

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.iconBg}>
        <MaterialCommunityIcons name="shield-check" size={140} color="#fff" style={{ opacity: 0.12 }} />
      </View>
      <Text style={styles.heading}>{t('app.promo.heading')}</Text>
      <Text style={styles.sub}>{t('app.promo.sub')}</Text>
      <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onPress}>
        <Text style={styles.ctaTxt}>{t('app.promo.cta')}</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.orange} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: COLORS.orange,
    padding: 22,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  iconBg: { position: 'absolute', right: -12, bottom: -20 },
  heading: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
    marginBottom: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ctaTxt: { color: COLORS.orange, fontWeight: '700', fontSize: 14 },
});
