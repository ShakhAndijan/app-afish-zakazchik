import { useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Pastki xavfsiz zona (navigatsiya paneli): klaviatura ochiq bo'lganda kerak emas —
// klaviatura o'zi shu joyni egallaydi.
export default function useBottomInset() {
  const { bottom } = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((st) => st.isVisible);
  return keyboardVisible ? 0 : bottom;
}
