import ProfileHelpScreen from '../screens/ProfileHelpScreen';
import useGoBack from '../navigation/useGoBack';

export default function HelpMenuRoute() {
  return <ProfileHelpScreen onBack={useGoBack()} />;
}
