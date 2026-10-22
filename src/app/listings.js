import { useLocalSearchParams } from 'expo-router';
import ListingsScreen from '../screens/ListingsScreen';
import useGoBack from '../navigation/useGoBack';

export default function ListingsRoute() {
  const { saved, workerId, workerName } = useLocalSearchParams();
  return (
    <ListingsScreen
      onBack={useGoBack()}
      initialSaved={saved === '1'}
      workerId={workerId ? Number(workerId) : null}
      workerName={workerName ? String(workerName) : ''}
    />
  );
}
