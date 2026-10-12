import { useCategoriesQuery } from '../../../queries/categories';
import SeasonalJobs from '../../zakazchi-main/components/SeasonalJobs';

// Mehmon uchun "Mavsum ishlari": kartani bossa kirish sahifasiga o'tkaziladi.
export default function SeasonalSection({ onLogin }) {
  const { categories } = useCategoriesQuery();

  return (
    <SeasonalJobs categories={categories} onPick={() => onLogin?.()} style={{ marginTop: 24 }} />
  );
}
