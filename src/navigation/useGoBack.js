import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// "Orqaga": tarixda ekran bo'lsa o'sha yerga, bo'lmasa (masalan deep link bilan ochilgan)
// boshiga qaytaradi — mehmonni landingga, kirganni bosh sahifaga.
export default function useGoBack() {
  const router = useRouter();
  const { signedIn } = useAuth();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(signedIn ? '/home' : '/');
  }, [router, signedIn]);
}
