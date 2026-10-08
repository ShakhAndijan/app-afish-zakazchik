import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Suzuvchi pastki menyu ostida qolmaslik uchun ro'yxat oxiridagi bo'sh joy: `base` + telefonning
// pastki tizim paneli (orqaga / uy tugmalari yoki imo-ishora chizig'i) balandligi.
export default function useTabBarSpace(base = 90) {
  return base + useSafeAreaInsets().bottom;
}
