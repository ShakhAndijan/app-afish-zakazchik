import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import WorkerCard from '../../../components/WorkerCard';
import { useWithPresence } from '../../../queries/presence';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';
import EmptyCard from './EmptyCard';

// "Eng zo'r ustalar" ro'yxati. Ma'lumot (`state`) va kategoriya bo'yicha filtr
// `useHomeData` da boshqariladi — shuning uchun pull-to-refresh bu yerni ham yangilaydi.
export default function TopWorkers({ state, onSelectUsta, onRetry }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const workers = useWithPresence(state.data ?? []);

  if (state.loading) return <SectionLoader height={176} />;
  if (state.error) return <SectionError onRetry={onRetry} />;

  if (workers.length === 0) {
    return (
      <EmptyCard
        style={{ marginHorizontal: 0 }}
        icon={<MaterialCommunityIcons name="account-search-outline" size={22} color={t.muted} />}
        title={tr('zakazchiMain.workersEmpty')}
      />
    );
  }

  return (
    <>
      {workers.map((u, i) => (
        <WorkerCard
          key={u.id}
          worker={u}
          rank={i}
          onPress={() => onSelectUsta(u)}
          style={i < workers.length - 1 && { marginBottom: 12 }}
        />
      ))}
    </>
  );
}
