import { Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LIGHT = require('../../assets/logo.png');
const DARK = require('../../assets/logo-on-dark.png');
const ASPECT = 1200 / 170;

// Harna logosi (belgi + HARNA yozuvi): to'q fonda yozuvi och rangli variant, och fonda asosiy variant.
// `dark` berilsa mavzu e'tiborga olinmaydi (masalan, doim to'q fonli kirish ekranlari uchun).
// Balandlik kenglikdan olinadi.
export default function BrandLogo({ width = 160, dark, style }) {
  const { theme } = useTheme();
  const onDark = dark ?? theme.isDark;
  return (
    <Image
      source={onDark ? DARK : LIGHT}
      style={[{ width, height: width / ASPECT }, style]}
      resizeMode="contain"
      accessibilityLabel="harna.uz"
    />
  );
}
