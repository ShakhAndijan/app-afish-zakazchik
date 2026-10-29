import { View, StyleSheet } from 'react-native';
import BrandLogo from '../BrandLogo';

export default function AppLogo() {
  return (
    <View style={styles.wrap}>
      <BrandLogo width={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
