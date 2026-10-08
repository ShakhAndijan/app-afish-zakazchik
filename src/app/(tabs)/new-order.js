import { useCallback, useState } from 'react';
import { useRouter, useNavigation, useLocalSearchParams, useFocusEffect } from 'expo-router';
import NewOrderScreen from '../../screens/NewOrderScreen';
import { decodeParam } from '../../navigation/params';

// Tabdan chiqilganda forma yangidan boshlanadi (avvalgi xatti-harakat); `worker` — ma'lum ustaga
// buyurtma berilganda uzatiladigan usta.
export default function NewOrderRoute() {
  const router = useRouter();
  const navigation = useNavigation();
  const { worker } = useLocalSearchParams();
  const [formKey, setFormKey] = useState(0);

  useFocusEffect(
    useCallback(
      () => () => {
        navigation.setParams({ worker: undefined });
        setFormKey((k) => k + 1);
      },
      [navigation]
    )
  );

  return (
    <NewOrderScreen
      key={`${formKey}:${worker ?? ''}`}
      targetWorker={decodeParam(worker)}
      // Zakaz berilgach bosh sahifaga qaytiladi — u yerda "Faol zakazlar" ro'yxatida ko'rinadi.
      onOrderCreated={() => router.navigate('/home')}
    />
  );
}
