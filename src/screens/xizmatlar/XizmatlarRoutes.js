import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useNavigation, useLocalSearchParams, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XizmatlarStyleProvider, useXizmatlarStyles } from './styles';
import useFilters from './hooks/useFilters';
import useCategories from './hooks/useCategories';
import useCategoryWorkers from './hooks/useCategoryWorkers';
import useVerifiedWorkers from './hooks/useVerifiedWorkers';
import useOverallStats from './hooks/useOverallStats';
import SearchFilterRow from './components/SearchFilterRow';
import FilterModal from './components/FilterModal';
import RegionPickerSheet from './components/RegionPickerSheet';
import BrowseView from './views/BrowseView';
import SubCategoryView from './views/SubCategoryView';
import CategoryView from './views/CategoryView';
import AppLoader from '../../components/AppLoader';
import { ustaRoute } from '../../navigation/params';

// "Xizmatlar" bo'limi `app/(tabs)/services/` papkasida o'zining Stack navigatoriga ega:
//   index            — yo'nalishlar ro'yxati (BrowseView)
//   group/[id]       — asosiy yo'nalishning quyi yo'nalishlari (SubCategoryView)
//   category/[id]    — tanlangan yo'nalishdagi ustalar (CategoryView)
// Har bir qadam haqiqiy marshrut, shuning uchun telefonning "orqaga" tugmasi bir qadam qaytaradi.
// Qidiruv, filtrlar va yo'nalishlar ro'yxati qadamlar orasida umumiy — shu kontekstda turadi.

const XizmatlarContext = createContext(null);
const useXizmatlar = () => useContext(XizmatlarContext);

function XizmatlarProvider({ children }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useFilters(false);
  const catalog = useCategories();

  const value = { filterOpen, setFilterOpen, filters, ...catalog };
  return <XizmatlarContext.Provider value={value}>{children}</XizmatlarContext.Provider>;
}

// Stack va umumiy oynalar (filtr, hudud tanlash) — ular faqat bir marta chiziladi.
export function XizmatlarLayout() {
  return (
    <XizmatlarStyleProvider>
      <XizmatlarProvider>
        <LayoutBody />
      </XizmatlarProvider>
    </XizmatlarStyleProvider>
  );
}

function LayoutBody() {
  const { t } = useXizmatlarStyles();
  const { filters, filterOpen, setFilterOpen } = useXizmatlar();
  const inCategory = useSegments().includes('category');

  // Barqaror obyekt: har renderda yangi bo'lsa navigator barcha ekranlarni qayta hisoblaydi.
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      // Native (UI oqimida ishlaydigan) iOS uslubidagi o'tish; Android'da ham silliq.
      animation: 'ios_from_right',
      // Orqada qolgan ekranlar qayta chizilmaydi — o'tish paytida JS oqimi bo'sh.
      freezeOnBlur: true,
      contentStyle: { backgroundColor: t.bg },
    }),
    [t.bg]
  );

  return (
    <>
      <Stack screenOptions={screenOptions} />
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        inCategory={inCategory}
      />
      <RegionPickerSheet filters={filters} />
    </>
  );
}

function Frame({ children }) {
  const { styles } = useXizmatlarStyles();
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

// Qidiruv matni har bir ekranning o'zida turadi (umumiy emas): ekranlar orasida o'tganda
// boshqa ekranning matni ro'yxatni o'zgartirib yubormaydi.
function SearchRow({ query, setQuery }) {
  const { filterOpen, setFilterOpen, filters } = useXizmatlar();
  return (
    <SearchFilterRow
      query={query}
      onQueryChange={setQuery}
      filterOpen={filterOpen}
      onToggleFilter={() => setFilterOpen((v) => !v)}
      hasActiveFilters={filters.hasActive}
    />
  );
}

// Ekran ochilayotganda birinchi kadr yengil bo'lsin: og'ir kontent o'tish animatsiyasi tugagach
// chiziladi (tugash hodisasi kelmasa ham, qisqa muddatdan keyin baribir chiziladi).
function useTransitionReady(fallbackMs = 450) {
  const navigation = useNavigation();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => setReady(true);
    const unsubscribe = navigation.addListener('transitionEnd', done);
    const timer = setTimeout(done, fallbackMs);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [navigation, fallbackMs]);
  return ready;
}

// Yengil "qobiq": qidiruv qatori va yuklanish belgisi.
function Placeholder({ searchRow }) {
  return (
    <>
      {searchRow}
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
        <AppLoader size={90} />
      </View>
    </>
  );
}

// Keyingi qadamga o'tish va ortga qaytish.
function useStepNav() {
  const router = useRouter();
  const { setFilterOpen } = useXizmatlar();

  const toGroup = (id) => {
    setFilterOpen(false);
    router.push({ pathname: '/services/group/[id]', params: { id: String(id) } });
  };
  const toCategory = (id) => {
    setFilterOpen(false);
    router.push({ pathname: '/services/category/[id]', params: { id: String(id) } });
  };
  // Deep link bilan to'g'ridan-to'g'ri ochilgan bo'lsa, ortga qaytishga joy yo'q — ro'yxatga o'tadi.
  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/services');
  }, [router]);

  return { router, toGroup, toCategory, back };
}

export function BrowseRoute() {
  const navigation = useNavigation();
  const { verified } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const { filters, categories, all, loading } = useXizmatlar();
  const { router, toGroup, toCategory } = useStepNav();
  const overallStats = useOverallStats();
  const verifiedWorkers = useVerifiedWorkers(filters.certifiedOnly);
  const { setCertifiedOnly } = filters;

  // Bosh sahifadagi "tasdiqlangan ustalar" kartasi (`verified` parametri) filtrni yoqadi.
  // Parametr bir martalik: o'qilgach tozalanadi, keyingi bosishda yana ishlaydi.
  useEffect(() => {
    if (!verified) return;
    setCertifiedOnly(true);
    navigation.setParams({ verified: undefined });
  }, [verified, setCertifiedOnly, navigation]);

  const openCategory = (id) => {
    const picked = all.find((c) => c.id === id);
    if (picked?.children?.length) toGroup(id);
    else toCategory(id);
  };

  return (
    <Frame>
      <BrowseView
        searchRow={<SearchRow query={query} setQuery={setQuery} />}
        query={query}
        overallStats={overallStats}
        certifiedOnly={filters.certifiedOnly}
        verified={verifiedWorkers}
        onClearVerified={() => filters.setCertifiedOnly(false)}
        categories={categories}
        allCategories={all}
        categoriesLoading={loading}
        onOpenCategory={openCategory}
        onSelectWorker={(usta) => router.push(ustaRoute(usta))}
      />
    </Frame>
  );
}

export function GroupRoute() {
  const { id } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const { categories } = useXizmatlar();
  const { toCategory, back } = useStepNav();
  const parentId = Number(id);
  const ready = useTransitionReady();
  const searchRow = <SearchRow query={query} setQuery={setQuery} />;

  return (
    <Frame>
      {ready ? (
        <SubCategoryView
          searchRow={searchRow}
          parent={categories.find((c) => c.id === parentId)}
          query={query}
          onBack={back}
          onOpenCategory={toCategory}
          onOpenAll={toCategory}
        />
      ) : (
        <Placeholder searchRow={searchRow} />
      )}
    </Frame>
  );
}

export function CategoryRoute() {
  const { id } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const { filters, all } = useXizmatlar();
  const { router, back } = useStepNav();
  const categoryId = Number(id);
  const categoryWorkers = useCategoryWorkers(categoryId, filters, query);
  const ready = useTransitionReady();
  const searchRow = <SearchRow query={query} setQuery={setQuery} />;

  return (
    <Frame>
      {ready ? (
        <CategoryView
          searchRow={searchRow}
          category={all.find((c) => c.id === categoryId)}
          workers={categoryWorkers.workers}
          loading={categoryWorkers.loading}
          total={categoryWorkers.total}
          query={query}
          filters={filters}
          onSelectWorker={(usta) => router.push(ustaRoute(usta))}
          onBack={back}
        />
      ) : (
        <Placeholder searchRow={searchRow} />
      )}
    </Frame>
  );
}
