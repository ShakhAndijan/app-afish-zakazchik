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
import useTabBarSpace from '../../../navigation/useTabBarSpace';
import { seasonOf, seasonalCategories } from '../season';
import { FEATURES } from '../../../constants/config';

// Bosh ko'rinish (yo'nalish tanlanmagan): statistika, tasdiqlangan ustalar,
// ommabop va barcha yo'nalishlar. Qidiruv bo'lsa — faqat mos yo'nalishlar.
export default function BrowseView({
  searchRow,
  query,
  overallStats,
  certifiedOnly,
  verified,
  onClearVerified,
  categories,
  categoriesLoading,
  onOpenCategory,
  onSelectWorker,
}) {
  const bottomSpace = useTabBarSpace(90);
  const { t: tr } = useLanguage();
  const { styles } = useXizmatlarStyles();
  const searching = !!query.trim();

  // Joriy mavsumga mos yo'nalishlar (mos kategoriya bo'lmasa bo'lim ko'rsatilmaydi).
  const season = seasonOf();
  const seasonal = useMemo(() => seasonalCategories(categories, season), [categories, season]);

  const visibleCategories = useMemo(() => {
    if (!searching) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter((c) => c.label.toLowerCase().includes(q));
  }, [categories, query, searching]);

  return (
    <>
      {searchRow}

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: bottomSpace }} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.sectionTitle}>{tr('xizmatlar.browse.title')}</Text>
          <Text style={styles.sectionSubtitle}>{tr('xizmatlar.browse.subtitle')}</Text>

          {!searching && (
            <>
              {FEATURES.overallStats && <OverallStats stats={overallStats} />}

              {certifiedOnly && (
                <VerifiedSection verified={verified} onClear={onClearVerified} onSelectWorker={onSelectWorker} />
              )}

              {seasonal.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>
                    {`${tr('xizmatlar.browse.seasonalJobs')} · ${tr(`xizmatlar.browse.seasons.${season}`)}`}
                  </Text>
                  <View style={{ marginBottom: 22 }}>
                    <PopularCategories categories={seasonal} onSelect={onOpenCategory} />
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
