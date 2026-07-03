import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function TermsText() {
  return (
    <Text style={styles.text}>
      Davom etish orqali{' '}
      <Text style={styles.bold}>Shartlar</Text>
      {' va '}
      <Text style={styles.bold}>Maxfiylik siyosati</Text>
      ga rozilik bildirasiz.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  bold: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
