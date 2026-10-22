import WorkersScreen from '../screens/WorkersScreen';
import useGoBack from '../navigation/useGoBack';

export default function WorkersRoute() {
  return <WorkersScreen onBack={useGoBack()} />;
}
