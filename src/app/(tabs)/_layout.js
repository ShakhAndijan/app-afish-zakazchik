import { Tabs } from 'expo-router';
import AppTabBar from '../../navigation/AppTabBar';
import { useTheme } from '../../context/ThemeContext';

// Pastki menyu tartibini AppTabBar (BottomNav) o'zi belgilaydi: home, new-order, ads, profile. `services`
// menyuda ko'rinmaydi, lekin bosh sahifadagi "Barchasi" orqali ochiladi (AppTabBar da "Asosiy" belgilanadi).
//
// Expo Router 58: ekran ko'rinishi uchun u shu yerda e'lon qilinishi SHART, e'lon qilinmasa navigator hech narsa
// chizmaydi. Boshlang'ich tab `anchor` bilan belgilanadi; qolganlari marshrut nomi uzunligi bo'yicha saralanadi
// (home, ads, profile, services, new-order). E'lon tartibi shu tartibga teng bo'lishi kerak, aks holda dev rejimida
// "ROUTE_NAMES_CHANGED ... was not handled" xatosi chiqadi. Yangi ekran qo'shsangiz, uni shu tartibga mos joyga qo'ying.
export const unstable_settings = { anchor: 'home' };

export default function TabsLayout() {
  const { theme: t } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="ads" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="new-order" />
    </Tabs>
  );
}
