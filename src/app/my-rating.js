import MyRatingScreen from '../screens/MyRatingScreen';
import useGoBack from '../navigation/useGoBack';

export default function MyRatingRoute() {
  return <MyRatingScreen onBack={useGoBack()} />;
}
