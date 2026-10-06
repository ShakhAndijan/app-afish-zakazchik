import { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import WorkDetailScreen from '../screens/WorkDetailScreen';
import useGoBack from '../navigation/useGoBack';
import { decodeParam, ustaRoute } from '../navigation/params';

export default function WorkRoute() {
  const router = useRouter();
  const goBack = useGoBack();
  const { data } = useLocalSearchParams();
  const work = useMemo(() => decodeParam(data), [data]);

  return (
    <WorkDetailScreen
      work={work}
      onBack={goBack}
      onSelectUsta={(usta) => router.push(ustaRoute(usta))}
    />
  );
}
