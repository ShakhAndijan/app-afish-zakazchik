import ZakazchiHelpScreen from '../screens/ZakazchiHelpScreen';
import useGoBack from '../navigation/useGoBack';

export default function HelpRoute() {
  return <ZakazchiHelpScreen onBack={useGoBack()} />;
}
