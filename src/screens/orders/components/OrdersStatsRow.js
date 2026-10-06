import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../utils/format';
import { STATUS_META } from '../constants';
import StatTile from './StatTile';

// Uchta ko'rsatkich: jami buyurtmalar, bajarilganlari va sarflangan summa (ming so'mda).
export default function OrdersStatsRow({ stats }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLanguage();

  return (
    <View style={s.row}>
      <StatTile
        icon="archive"
        iconColor={t.orange}
        iconBg={t.orange + '18'}
        value={tr('profile.menu.itemCount', { n: stats.all })}
        label={tr('orders.statTotal')}
        t={t}
      />
      <StatTile
        icon="check-circle"
        iconColor={STATUS_META.done.color}
        iconBg={STATUS_META.done.bg}
        value={tr('profile.menu.itemCount', { n: stats.done })}
        label={tr('orders.statDone')}
        t={t}
      />
      <StatTile
        icon="credit-card"
        iconColor={t.gold}
        iconBg="rgba(245,196,81,0.14)"
        value={`${formatNumber(Math.round(stats.spent / 1000))}k`}
        label={tr('orders.statSpent')}
        t={t}
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
});
