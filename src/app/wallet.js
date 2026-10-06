import WalletScreen from '../screens/WalletScreen';
import useGoBack from '../navigation/useGoBack';

export default function WalletRoute() {
  return <WalletScreen onBack={useGoBack()} />;
}
