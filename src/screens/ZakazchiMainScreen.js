import { useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AfishLoader from '../components/AfishLoader';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useWallet } from '../context/WalletContext';
import { decodeParam, ustaRoute, workRoute, newOrderRoute } from '../navigation/params';
import useHomeData from './zakazchi-main/hooks/useHomeData';
import HomeHeader from './zakazchi-main/components/HomeHeader';
import WalletQuickCard from './zakazchi-main/components/WalletQuickCard';
import OrderSuccessCard from './zakazchi-main/components/OrderSuccessCard';
import SectionHeader from './zakazchi-main/components/SectionHeader';
import SectionLoader from './zakazchi-main/components/SectionLoader';
import SectionError from './zakazchi-main/components/SectionError';
import ServiceCarousel from './zakazchi-main/components/ServiceCarousel';
import TopWorkers from './zakazchi-main/components/TopWorkers';
import WorksCarousel from './zakazchi-main/components/WorksCarousel';
import FavoriteWorkers from './zakazchi-main/components/FavoriteWorkers';
import BenefitsSection from './zakazchi-main/components/BenefitsSection';
import ReturningCustomerSection from './zakazchi-main/components/ReturningCustomerSection';
import ReviewsCarousel from './zakazchi-main/components/ReviewsCarousel';

// Mijoz bosh sahifasi (pastki menyudagi "home" tabi). Boshqa ekranlarga o'tish expo-router orqali.
export default function ZakazchiMainScreen() {
  const router = useRouter();
  // Buyurtma yaratilgach new-order tabidan keladi (JSON parametr); karta yopilganda tozalanadi.
  const { createdOrder } = useLocalSearchParams();
  const justCreatedOrder = decodeParam(createdOrder);
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const { balance } = useWallet();
  const home = useHomeData();

  // Bosh sahifaga qaytilganda shaxsiy xulosa (faol buyurtmalar) yangilanadi.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      home.refreshSummary();
    }, [home.refreshSummary])
  );

  const openUsta = (usta) => router.push(ustaRoute(usta));
  const orderWorker = (worker) => router.navigate(newOrderRoute(worker));

  const hasPersonal =
    !!home.summary.data &&
    (home.summary.data.activeOrders.length > 0 || !!home.summary.data.lastDone);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl
            refreshing={home.refreshing}
            onRefresh={home.refresh}
            tintColor={t.orange}
            colors={[t.orange]}
          />
        }
      >
        <HomeHeader />

        <View style={{ paddingHorizontal: 20 }}>
          <WalletQuickCard balance={balance} onPress={() => router.push('/wallet')} />
        </View>

        {!!justCreatedOrder && (
          <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
            <OrderSuccessCard order={justCreatedOrder} onClose={() => router.setParams({ createdOrder: undefined })} />
          </View>
        )}

        {home.initialLoading ? (
          <View style={{ paddingVertical: 140, alignItems: 'center', justifyContent: 'center' }}>
            <AfishLoader size={180} />
          </View>
        ) : home.allFailed ? (
          <SectionError style={{ marginHorizontal: 20, marginTop: 24 }} onRetry={home.refresh} />
        ) : (
          <>
            {/* ── Xizmatlar ── */}
            <View style={{ marginTop: 24 }}>
              <SectionHeader
                title={tr('app.taklifXizmatlar.title')}
                actionLabel={tr('common.seeAll')}
                onActionPress={() => home.selectCategory(null)}
                style={{ paddingHorizontal: 20 }}
              />
              {home.categories.loading ? (
                <SectionLoader height={110} />
              ) : home.categories.error ? (
                <SectionError
                  style={{ marginHorizontal: 20 }}
                  onRetry={() => home.retry('categories')}
                />
              ) : (
                <ServiceCarousel
                  categories={home.categories.data ?? []}
                  selectedId={home.selectedCategoryId}
                  onSelect={home.selectCategory}
                />
              )}
            </View>

            {/* ── Top ustalar ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <SectionHeader
                title={tr('app.engZorUstalar.title')}
                actionLabel={tr('app.engZorUstalar.rating')}
              />
              <TopWorkers
                state={home.workers}
                onSelectUsta={openUsta}
                onRetry={() => home.retry('workers')}
              />
            </View>

            {/* ── Eng zo'r ishlar ── */}
            <View style={{ marginTop: 24 }}>
              <SectionHeader
                title={tr('app.engZorIshlar.title')}
                actionLabel={tr('app.engZorIshlar.gallery')}
                style={{ paddingHorizontal: 20 }}
              />
              {home.works.loading ? (
                <SectionLoader height={150} />
              ) : home.works.error ? (
                <SectionError style={{ marginHorizontal: 20 }} onRetry={() => home.retry('works')} />
              ) : (
                <WorksCarousel works={home.works.data ?? []} onSelectWork={(work) => router.push(workRoute(work))} />
              )}
            </View>

            {/* ── Sevimli ustalar ── */}
            <FavoriteWorkers
              state={home.favorites}
              onSelectUsta={openUsta}
              onBrowse={() => router.navigate('/services')}
              onRetry={() => home.retry('favorites')}
            />

            {/* ── Mijoz holatiga qarab: buyurtmasi bor — shaxsiy blok, yo'q — "Nega AFISH?" ── */}
            {!home.summary.loading && (
              <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
                {hasPersonal ? (
                  <ReturningCustomerSection
                    summary={home.summary.data}
                    onOpenOrders={() => router.push('/orders')}
                    onReorder={(order) =>
                      orderWorker({
                        id: order.workerId,
                        name: order.master,
                        trade: order.service,
                        bgColor: order.color,
                        initial: order.letter,
                        categoryId: order.categoryId,
                      })
                    }
                  />
                ) : (
                  <BenefitsSection
                    stats={home.stats.data}
                    onOpenGuarantee={() => router.push('/help')}
                    onOpenVerified={() =>
                      router.navigate({ pathname: '/services', params: { verified: '1' } })
                    }
                  />
                )}
              </View>
            )}

            {/* ── Mijozlar fikri ── */}
            <ReviewsCarousel state={home.reviews} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
