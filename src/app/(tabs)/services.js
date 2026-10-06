import { useCallback } from 'react';
import { useRouter, useNavigation, useLocalSearchParams, useFocusEffect } from 'expo-router';
import XizmatlarScreen from '../../screens/XizmatlarScreen';
import { ustaRoute } from '../../navigation/params';

// `verified` parametri (bosh sahifadagi "tasdiqlangan ustalar" kartasidan) filtrni oldindan yoqadi
// va tabdan chiqilganda tozalanadi.
export default function ServicesRoute() {
  const router = useRouter();
  const navigation = useNavigation();
  const { verified } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => () => navigation.setParams({ verified: undefined }), [navigation])
  );

  return (
    <XizmatlarScreen
      key={verified ? 'verified' : 'all'}
      initialCertifiedOnly={!!verified}
      onSelectWorker={(usta) => router.push(ustaRoute(usta))}
    />
  );
}
