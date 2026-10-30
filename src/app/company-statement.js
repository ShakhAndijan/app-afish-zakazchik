import StatementScreen from '../screens/company/StatementScreen';
import useGoBack from '../navigation/useGoBack';

// Kompaniyaning oylik hisoboti.
export default function StatementScreenRoute() {
  return <StatementScreen onBack={useGoBack()} />;
}
