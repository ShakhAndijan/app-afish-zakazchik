import { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import OrderDetailScreen from '../../screens/OrderDetailScreen';
import useGoBack from '../../navigation/useGoBack';
import { decodeParam, ustaRoute } from '../../navigation/params';

export default function OrderRoute() {
  const router = useRouter();
  const goBack = useGoBack();
  const { id, data } = useLocalSearchParams();
  const order = useMemo(() => decodeParam(data) ?? { id }, [id, data]);

  return (
    <OrderDetailScreen
      order={order}
      onBack={goBack}
      onSelectUsta={(usta) => router.push(ustaRoute(usta))}
    />
  );
}
