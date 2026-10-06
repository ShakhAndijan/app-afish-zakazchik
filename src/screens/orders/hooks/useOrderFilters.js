import { useState, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { STATUS_META } from '../constants';

// Buyurtmalar ro'yxatini holat bo'yicha filtrlash: tanlangan tab, tablar ro'yxati,
// hisob-kitoblar (jami, faol, bajarilgan, bekor qilingan, sarflangan summa) va ko'rinadigan ro'yxat.
export default function useOrderFilters(orders) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();
  const [tab, setTab] = useState('all');

  const stats = useMemo(() => {
    const all = orders ?? [];
    const done = all.filter((o) => o.status === 'done');
    return {
      all: all.length,
      active: all.filter((o) => o.status === 'active').length,
      done: done.length,
      cancelled: all.filter((o) => o.status === 'cancelled').length,
      spent: done.reduce((sum, o) => sum + (o.price ?? 0), 0),
    };
  }, [orders]);

  const list = useMemo(
    () => (tab === 'all' ? orders ?? [] : (orders ?? []).filter((o) => o.status === tab)),
    [orders, tab]
  );

  const tabs = [
    { key: 'all', label: tr('orders.tabAll'), color: t.orange },
    { key: 'active', label: tr('orders.tabActive'), color: STATUS_META.active.color },
    { key: 'done', label: tr('orders.tabDone'), color: STATUS_META.done.color },
    { key: 'cancelled', label: tr('orders.tabCancelled'), color: STATUS_META.cancelled.color },
  ];

  return { tab, setTab, tabs, stats, list };
}
