import { TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';

// Qorong'i/yorug' mavzuni almashtirish tugmasi.
export default function ThemeToggleButton() {
  const { theme: t, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: t.isDark ? 'rgba(245,196,81,0.14)' : 'rgba(63,127,212,0.12)',
          borderColor: t.isDark ? 'rgba(245,196,81,0.28)' : 'rgba(63,127,212,0.24)',
        },
      ]}
      activeOpacity={0.8}
      onPress={toggleTheme}
    >
      <Feather name={t.isDark ? 'sun' : 'moon'} size={19} color={t.isDark ? t.gold : t.blue} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
