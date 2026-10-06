import { View, StyleSheet } from 'react-native';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';

// Marshrut nomi ↔ BottomNav kaliti.
const ROUTE_TO_KEY = {
  home: 'home',
  'new-order': 'newOrder',
  services: 'services',
  profile: 'profile',
};
const KEY_TO_ROUTE = Object.fromEntries(Object.entries(ROUTE_TO_KEY).map(([r, k]) => [k, r]));

// Mavjud suzuvchi BottomNav dizayni Tabs navigatoriga `tabBar` sifatida ulanadi.
// O'ram oynasi ixtiyoriy balandlikda: Android o'ram chegarasidan tashqaridagi bosishlarni o'tkazmaydi.
export default function AppTabBar({ state, navigation }) {
  const { theme: t } = useTheme();
  const activeRoute = state.routes[state.index];

  const onTabChange = (key) => {
    const route = state.routes.find((r) => r.name === KEY_TO_ROUTE[key]);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented && route.key !== activeRoute.key) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <BottomNav
        activeTab={ROUTE_TO_KEY[activeRoute.name]}
        onTabChange={onTabChange}
        accent={t.orange}
        background={t.navBg}
        border={t.border}
        muted={t.faint}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 },
});
