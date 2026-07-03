import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function SocialButton({ icon, label, variant = 'dark', onPress }) {
  const isLight = variant === 'light';
  return (
    <TouchableOpacity
      style={[styles.btn, isLight ? styles.btnLight : styles.btnDark]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.label, isLight ? styles.labelLight : styles.labelDark]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 15,
    gap: 11,
  },
  btnLight: {
    backgroundColor: COLORS.white,
  },
  btnDark: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  labelLight: {
    color: '#1f2937',
  },
  labelDark: {
    color: COLORS.white,
  },
});
