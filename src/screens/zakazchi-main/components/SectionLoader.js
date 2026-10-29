import { View } from 'react-native';
import AppLoader from '../../../components/AppLoader';

export default function SectionLoader({ height = 140 }) {
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <AppLoader size={80} />
    </View>
  );
}
