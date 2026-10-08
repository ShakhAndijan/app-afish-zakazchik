import { useState, useEffect } from 'react';
import { getCategories } from '../../../api/categories';
import SeasonalJobs from '../../zakazchi-main/components/SeasonalJobs';

// Mehmon uchun "Mavsum ishlari": kartani bossa kirish sahifasiga o'tkaziladi.
export default function SeasonalSection({ onLogin }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <SeasonalJobs categories={categories} onPick={() => onLogin?.()} style={{ marginTop: 24 }} />
  );
}
