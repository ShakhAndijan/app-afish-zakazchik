import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { useLanguage } from '../../../context/LanguageContext';
import { getWorkers } from '../../../api/workers';
import WorkerCard from '../../../components/WorkerCard';

// "Eng zo'r ustalar": reyting bo'yicha 5 ta usta. Ma'lumot bo'lmasa — chizilmaydi.
export default function TopWorkers({ onSelectUsta }) {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    getWorkers({ size: 5 })
      .then(setWorkers)
      .catch(() => {});
  }, []);

  if (workers.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.engZorUstalar.title')}</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.link}>{t('app.engZorUstalar.rating')}</Text>
        </TouchableOpacity>
      </View>
      {workers.map((worker, i) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          rank={i}
          onPress={() => onSelectUsta?.(worker)}
          style={[styles.card, i < workers.length - 1 && { marginBottom: 12 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 13,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  link: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  card: { marginHorizontal: 16 },
});
