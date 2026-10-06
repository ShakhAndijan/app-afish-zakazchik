import { Tabs } from 'expo-router';
import AppTabBar from '../../navigation/AppTabBar';

// Pastki menyu: tartib BottomNav bilan bir xil (home, new-order, services, profile).
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="new-order" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
