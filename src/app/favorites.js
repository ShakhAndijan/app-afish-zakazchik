import FavoritesScreen from '../screens/FavoritesScreen';
import useGoBack from '../navigation/useGoBack';

export default function FavoritesRoute() {
  return <FavoritesScreen onBack={useGoBack()} />;
}
