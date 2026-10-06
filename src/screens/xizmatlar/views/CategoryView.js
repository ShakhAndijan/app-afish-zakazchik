import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import AfishLoader from '../../../components/AfishLoader';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import { applyAdvFilters } from '../utils';
import CategoryHero from '../components/CategoryHero';
import CategoryStatsCard from '../components/CategoryStatsCard';
import WorkerList from '../components/WorkerList';
import EmptyBox from '../components/EmptyBox';

// Yo'nalish ko'rinishi: hero, statistika va shu yo'nalishdagi ustalar ro'yxati.
export default function CategoryView({
  searchRow,
  category,
  workers,
  loading,
  total,
  query,
  filters,
  onSelectWorker,
  onBack,
}) {
  const { t: tr } = useLanguage();
  const { styles } = useXizmatlarStyles();
  const { sort, minExp } = filters;

  // Qidiruv serverda (q); minimal tajriba filtri va "qimmat" tartibi mijoz tomonda.
  const results = useMemo(
    () => applyAdvFilters(workers, { sort, minExp }),
    [workers, sort, minExp]
  );

  // Tajriba mijoz tomonda filtrlanmagan bo'lsa — backenddagi umumiy son (u hudud, reyting,
  // tasdiqlangan va qidiruvni hisobga oladi; ro'yxat esa faqat 1-sahifa), aks holda filtrlangan son.
  const mastersCount = !minExp && total != null ? total : results.length;

  return (
    <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
      <View>
        <CategoryHero category={category} mastersCount={mastersCount} searchRow={searchRow} />

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <AfishLoader size={90} />
          </View>
        ) : (
          <>
            {results.length > 0 && <CategoryStatsCard mastersCount={mastersCount} workers={results} />}

            {results.length > 0 ? (
              <WorkerList workers={results} onSelect={onSelectWorker} />
            ) : (
              <EmptyBox
                style={{ marginTop: 16 }}
                text={query.trim() ? tr('xizmatlar.detail.noMastersFound') : tr('xizmatlar.detail.noMastersYet')}
              >
                <TouchableOpacity onPress={onBack}>
                  <Text style={styles.resetLink}>{tr('xizmatlar.detail.chooseAnother')}</Text>
                </TouchableOpacity>
              </EmptyBox>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
