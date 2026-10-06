import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';
import useGoBack from '../navigation/useGoBack';

export default function PaymentHistoryRoute() {
  return <PaymentHistoryScreen onBack={useGoBack()} />;
}
