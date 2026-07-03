import { View, Image, StyleSheet } from 'react-native';

export default function AppLogo() {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../../assets/afish-logo-vertical.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 130,
  },
});
