import { View } from 'react-native';
import AfishLoader from '../../../components/AfishLoader';

export default function SectionLoader({ height = 140 }) {
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <AfishLoader size={80} />
    </View>
  );
}
