import { View, Text } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { s } from '../styles';

// Forma bo'limi: kichik sarlavha va maydonlar joylashgan karta.
export default function FormSection({ title, children }) {
  const { theme: t } = useTheme();

  return (
    <>
      <Text style={[s.groupLabel, { color: t.faint }]}>{title}</Text>
      <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>{children}</View>
    </>
  );
}
