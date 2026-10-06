import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { orderRoute } from '../navigation/params';
import AfishLoader from '../components/AfishLoader';
import SectionError from './zakazchi-main/components/SectionError';
import useMyOrders from './orders/hooks/useMyOrders';
import useOrderFilters from './orders/hooks/useOrderFilters';
import OrdersHeader from './orders/components/OrdersHeader';
import OrdersStatsRow from './orders/components/OrdersStatsRow';
import OrdersTabs from './orders/components/OrdersTabs';
import OrderCard from './orders/components/OrderCard';
import OrdersEmpty from './orders/components/OrdersEmpty';

// "Buyurtmalarim": statistika, holat tablari va buyurtmalar ro'yxati. Kartani bossangiz
// buyurtma tafsiloti sahifasi (router) ochiladi.
export default function ZakazchiOrdersScreen({ onBack }) {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { orders, initialLoading, failed, refreshing, refresh, retry } = useMyOrders();
  const { tab, setTab, tabs, stats, list } = useOrderFilters(orders);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <OrdersHeader onBack={onBack} />

      {initialLoading ? (
        <View style={s.center}>
          <AfishLoader size={180} />
        </View>
      ) : failed ? (
        <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={retry} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={t.orange}
              colors={[t.orange]}
            />
          }
        >
          <OrdersStatsRow stats={stats} />
          <OrdersTabs tabs={tabs} active={tab} onChange={setTab} counts={stats} t={t} />

          <View style={s.list}>
            {list.length === 0 ? (
              <OrdersEmpty />
            ) : (
              list.map((order) => (
                <OrderCard key={order.id} order={order} onPress={() => router.push(orderRoute(order))} t={t} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, gap: 11 },
});
