import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XizmatlarStyleProvider, useXizmatlarStyles } from './xizmatlar/styles';
import useFilters from './xizmatlar/hooks/useFilters';
import useCategories from './xizmatlar/hooks/useCategories';
import useCategoryWorkers from './xizmatlar/hooks/useCategoryWorkers';
import useVerifiedWorkers from './xizmatlar/hooks/useVerifiedWorkers';
import useOverallStats from './xizmatlar/hooks/useOverallStats';
import SearchFilterRow from './xizmatlar/components/SearchFilterRow';
import FilterModal from './xizmatlar/components/FilterModal';
import RegionPickerSheet from './xizmatlar/components/RegionPickerSheet';
import BrowseView from './xizmatlar/views/BrowseView';
import CategoryView from './xizmatlar/views/CategoryView';

// "Xizmatlar" ekrani: ikki ko'rinish — yo'nalishlar ro'yxati (BrowseView) va tanlangan
// yo'nalishdagi ustalar (CategoryView). Ustani bossangiz usta sahifasi (router) ochiladi.
export default function XizmatlarScreen(props) {
  return (
    <XizmatlarStyleProvider>
      <XizmatlarContent {...props} />
    </XizmatlarStyleProvider>
  );
}

function XizmatlarContent({ onSelectWorker, initialCertifiedOnly = false }) {
  const { styles } = useXizmatlarStyles();

  const [catFilter, setCatFilter] = useState(null);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const filters = useFilters(initialCertifiedOnly);
  const { categories, popular, loading: categoriesLoading } = useCategories();
  const overallStats = useOverallStats();
  const verified = useVerifiedWorkers(!catFilter && filters.certifiedOnly);
  const categoryWorkers = useCategoryWorkers(catFilter, filters, query);

  const openCategory = (categoryId) => {
    setCatFilter(categoryId);
    setFilterOpen(false);
  };

  const backToCategories = () => {
    setCatFilter(null);
    categoryWorkers.reset();
  };

  const searchRow = (
    <SearchFilterRow
      embedded={!!catFilter}
      onBack={backToCategories}
      query={query}
      onQueryChange={setQuery}
      filterOpen={filterOpen}
      onToggleFilter={() => setFilterOpen((v) => !v)}
      hasActiveFilters={filters.hasActive}
    />
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {catFilter ? (
        <CategoryView
          searchRow={searchRow}
          category={categories.find((c) => c.id === catFilter)}
          workers={categoryWorkers.workers}
          loading={categoryWorkers.loading}
          total={categoryWorkers.total}
          query={query}
          filters={filters}
          onSelectWorker={onSelectWorker}
          onBack={backToCategories}
        />
      ) : (
        <BrowseView
          searchRow={searchRow}
          query={query}
          overallStats={overallStats}
          certifiedOnly={filters.certifiedOnly}
          verified={verified}
          onClearVerified={() => filters.setCertifiedOnly(false)}
          popular={popular}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onOpenCategory={openCategory}
          onSelectWorker={onSelectWorker}
        />
      )}


      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        inCategory={!!catFilter}
      />
      <RegionPickerSheet filters={filters} />
    </SafeAreaView>
  );
}
