import ZakazchiOrdersScreen from '../screens/ZakazchiOrdersScreen';
import useGoBack from '../navigation/useGoBack';

export default function OrdersRoute() {
  return <ZakazchiOrdersScreen onBack={useGoBack()} />;
}
