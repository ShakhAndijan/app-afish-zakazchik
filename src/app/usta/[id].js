import { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import UstaDetailScreen from '../../screens/UstaDetailScreen';
import { useAuth } from '../../context/AuthContext';
import useGoBack from '../../navigation/useGoBack';
import { decodeParam, newOrderRoute, workRoute } from '../../navigation/params';

// Usta profili. Ro'yxatdan kelsa `data` (qisqa ma'lumot) bor, deep link bo'lsa faqat `id` —
// qolganini ekran backenddan yuklaydi.
export default function UstaRoute() {
  const router = useRouter();
  const goBack = useGoBack();
  const { signedIn } = useAuth();
  const { id, data } = useLocalSearchParams();

  const usta = useMemo(() => {
    const parsed = decodeParam(data);
    if (parsed?.id != null) return parsed;
    const numericId = Number(id);
    return { ...parsed, id: Number.isFinite(numericId) ? numericId : undefined };
  }, [id, data]);

  return (
    <UstaDetailScreen
      usta={usta}
      isLoggedIn={signedIn}
      onBack={goBack}
      onGoToLogin={() => router.push('/login')}
      onOrderWorker={(worker) => router.dismissTo(newOrderRoute(worker))}
      onSelectWork={(work) => router.push(workRoute(work))}
    />
  );
}
