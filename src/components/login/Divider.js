import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function Divider({ label = 'yoki' }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  text: {
    color: COLORS.faint,
    fontSize: 12.5,
  },
});
