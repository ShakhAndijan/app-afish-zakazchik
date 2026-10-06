import { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import AfishLoader from '../../../components/AfishLoader';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import OverallStats from '../components/OverallStats';
import VerifiedSection from '../components/VerifiedSection';
import PopularCategories from '../components/PopularCategories';
import CategoryTile from '../components/CategoryTile';
import EmptyBox from '../components/EmptyBox';

// Bosh ko'rinish (yo'nalish tanlanmagan): statistika, tasdiqlangan ustalar,
// ommabop va barcha yo'nalishlar. Qidiruv bo'lsa — faqat mos yo'nalishlar.
export default function BrowseView({
  searchRow,
  query,
  overallStats,
  certifiedOnly,
  verified,
  onClearVerified,
  popular,
  categories,
  categoriesLoading,
  onOpenCategory,
  onSelectWorker,
}) {
  const { t: tr } = useLanguage();
  const { styles } = useXizmatlarStyles();
  const searching = !!query.trim();

  const visibleCategories = useMemo(() => {
    if (!searching) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter((c) => c.label.toLowerCase().includes(q));
  }, [categories, query, searching]);

  return (
    <>
      {searchRow}

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.sectionTitle}>{tr('xizmatlar.browse.title')}</Text>
          <Text style={styles.sectionSubtitle}>{tr('xizmatlar.browse.subtitle')}</Text>

          {!searching && (
            <>
              <OverallStats stats={overallStats} />

              {certifiedOnly && (
                <VerifiedSection verified={verified} onClear={onClearVerified} onSelectWorker={onSelectWorker} />
              )}

              {popular.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>{tr('xizmatlar.browse.popularDirections')}</Text>
                  <View style={{ marginBottom: 22 }}>
                    <PopularCategories categories={popular} onSelect={onOpenCategory} />
                  </View>
                </>
              )}
            </>
          )}

          <Text style={styles.groupLabel}>
            {searching ? tr('xizmatlar.browse.searchResults') : tr('xizmatlar.browse.allDirections')}
          </Text>
          {categoriesLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <AfishLoader size={90} />
            </View>
          ) : visibleCategories.length > 0 ? (
            <View style={styles.categoryGrid}>
              {visibleCategories.map((c) => (
                <CategoryTile key={c.id} item={c} onPress={() => onOpenCategory(c.id)} />
              ))}
            </View>
          ) : (
            <EmptyBox text={tr('xizmatlar.browse.noDirectionsFound')} />
          )}
        </View>
      </ScrollView>
    </>
  );
}
