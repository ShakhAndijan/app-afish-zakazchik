import { View, Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';

// Bosh ro'yxat tepasidagi umumiy statistika: faol ustalar, o'rtacha reyting, tasdiqlanganlar.
export default function OverallStats({ stats }) {
  const { t: tr } = useLanguage();
  const { t, styles } = useXizmatlarStyles();

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCell}>
        <Text style={styles.statValue}>{stats.totalMasters}</Text>
        <Text style={styles.statLabel}>{tr('xizmatlar.browse.activeMasters')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCell}>
        <Text style={[styles.statValue, { color: t.gold }]}>★ {stats.avgRating}</Text>
        <Text style={styles.statLabel}>{tr('xizmatlar.browse.avgRating')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCell}>
        <Text style={[styles.statValue, { color: t.blue }]}>🏅 {stats.certified}</Text>
        <Text style={styles.statLabel}>{tr('xizmatlar.browse.certified')}</Text>
      </View>
    </View>
  );
}
