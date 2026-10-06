import ZakazchiAddressesScreen from '../screens/ZakazchiAddressesScreen';
import useGoBack from '../navigation/useGoBack';

export default function AddressesRoute() {
  return <ZakazchiAddressesScreen onBack={useGoBack()} />;
}
