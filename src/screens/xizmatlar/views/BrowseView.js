import { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import AppLoader from '../../../components/AppLoader';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import OverallStats from '../components/OverallStats';
import VerifiedSection from '../components/VerifiedSection';
import SeasonalRail from '../components/SeasonalRail';
import BentoGrid from '../components/BentoGrid';
import CategoryRow from '../components/CategoryRow';
import EmptyBox from '../components/EmptyBox';
import useTabBarSpace from '../../../navigation/useTabBarSpace';
import { seasonOf, seasonalCategories } from '../season';
import { FEATURES } from '../../../constants/config';

// Bosh ko'rinish (yo'nalish tanlanmagan): statistika, tasdiqlangan ustalar, mavsumiy
// yo'nalishlar va barcha yo'nalishlar (rangli "bento" kartalar). Qidiruv bo'lsa — mos
// yo'nalishlar ro'yxat qatorlarida (quyi yo'nalish ostida ota yo'nalish nomi bilan).
export default function BrowseView({
  searchRow,
  query,
  overallStats,
  certifiedOnly,
  verified,
  onClearVerified,
  categories,
  allCategories,
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
  const seasonal = useMemo(
    () => seasonalCategories(allCategories, season),
    [allCategories, season]
  );

  const found = useMemo(() => {
    if (!searching) return [];
    const q = query.trim().toLowerCase();
    return allCategories.filter((c) => c.label.toLowerCase().includes(q));
  }, [allCategories, query, searching]);

  const parentName = useMemo(() => new Map(categories.map((c) => [c.id, c.label])), [categories]);

  return (
    <>
      {searchRow}

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.sectionTitle}>{tr('xizmatlar.browse.title')}</Text>
          <Text style={styles.sectionSubtitle}>{tr('xizmatlar.browse.subtitle')}</Text>

          {!searching && (
            <>
              {FEATURES.overallStats && <OverallStats stats={overallStats} />}

              {certifiedOnly && (
                <VerifiedSection
                  verified={verified}
                  onClear={onClearVerified}
                  onSelectWorker={onSelectWorker}
                />
              )}

              {seasonal.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>
                    {`${tr('xizmatlar.browse.seasonalJobs')} · ${tr(`xizmatlar.browse.seasons.${season}`)}`}
                  </Text>
                  <View style={{ marginBottom: 22 }}>
                    <SeasonalRail items={seasonal} onPress={onOpenCategory} />
                  </View>
                </>
              )}
            </>
          )}

          <Text style={styles.groupLabel}>
            {searching
              ? tr('xizmatlar.browse.searchResults')
              : tr('xizmatlar.browse.allDirections')}
          </Text>
          {categoriesLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <AppLoader size={90} />
            </View>
          ) : searching ? (
            found.length > 0 ? (
              <View style={{ gap: 10 }}>
                {found.map((c) => (
                  <CategoryRow
                    key={c.id}
                    item={c}
                    hint={c.parentId != null ? parentName.get(c.parentId) : undefined}
                    onPress={() => onOpenCategory(c.id)}
                  />
                ))}
              </View>
            ) : (
              <EmptyBox text={tr('xizmatlar.browse.noDirectionsFound')} />
            )
          ) : categories.length > 0 ? (
            <BentoGrid items={categories} onPress={onOpenCategory} />
          ) : (
            <EmptyBox text={tr('xizmatlar.browse.noDirectionsFound')} />
          )}
        </View>
      </ScrollView>
    </>
  );
}
