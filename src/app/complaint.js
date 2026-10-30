import { useRouter, useLocalSearchParams } from 'expo-router';
import ComplaintScreen from '../screens/ComplaintScreen';
import useGoBack from '../navigation/useGoBack';

// Usta haqida shikoyat yozish: `?workerId=&name=` (usta profilidagi bayroqcha tugmasi).
export default function ComplaintRoute() {
  const router = useRouter();
  const { workerId, name } = useLocalSearchParams();
  const one = (v) => (Array.isArray(v) ? v[0] : v);
  return (
    <ComplaintScreen
      workerId={Number(one(workerId)) || undefined}
      workerName={one(name)}
      onBack={useGoBack()}
      onOpenMine={() => router.replace('/my-complaints')}
    />
  );
}
