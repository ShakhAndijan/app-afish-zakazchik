import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function PrimaryBtn({ label, icon, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.btn, disabled ? styles.disabled : styles.active]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 15,
    gap: 8,
  },
  active: {
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  disabled: {
    backgroundColor: '#3a2a22',
  },
  label: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  labelDisabled: {
    color: '#7a6253',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
