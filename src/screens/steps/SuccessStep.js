import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import PrimaryBtn from '../../components/login/PrimaryBtn';

export default function SuccessStep({ onHome }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconOuter}>
        <View style={styles.iconInner}>
          <Ionicons name="checkmark" size={34} color={COLORS.white} />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>Muvaffaqiyatli kirildi!</Text>
        <Text style={styles.subtitle}>
          Xush kelibsiz! Endi ishonchli ustalarni topishingiz mumkin.
        </Text>
      </View>

      <View style={styles.btnWrap}>
        <PrimaryBtn label="Asosiy sahifaga o'tish" onPress={onHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    gap: 28,
  },
  iconOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(47,163,122,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  textBlock: { alignItems: 'center', gap: 10 },
  title: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  btnWrap: { width: '100%', marginTop: 4 },
});
