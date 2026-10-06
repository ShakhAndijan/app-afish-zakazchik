import { View, Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import { avgExperience } from '../utils';

// Hero ustiga chiqib turgan kartochka: ustalar soni, tasdiqlanganlar, o'rtacha tajriba.
export default function CategoryStatsCard({ mastersCount, workers }) {
  const { t: tr } = useLanguage();
  const { t, styles } = useXizmatlarStyles();

  return (
    <View style={styles.statsCard}>
      <View style={styles.statCell}>
        <Text style={styles.statValue}>{mastersCount}</Text>
        <Text style={styles.statLabel}>{tr('xizmatlar.detail.activeMasters')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCell}>
        <Text style={[styles.statValue, { color: t.blue }]}>
          🏅 {workers.filter((w) => w.isIdentityVerified).length}
        </Text>
        <Text style={styles.statLabel}>{tr('xizmatlar.detail.certificate')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCell}>
        <Text style={styles.statValue}>{avgExperience(workers)}</Text>
        <Text style={styles.statLabel}>{tr('xizmatlar.detail.yearsExperience')}</Text>
      </View>
    </View>
  );
}
