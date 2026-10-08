import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { ENDPOINTS } from '../../../constants/config';
import { useLanguage } from '../../../context/LanguageContext';
import { DEFAULT_STATS } from '../constants';

const LOOK = {
  workers: { icon: 'account-group', color: '#3b82f6' },
  completedJobs: { icon: 'check-circle', color: '#2ecc71' },
  avgRating: { icon: 'star', color: '#f5b81f' },
};

// Umumiy statistika: ustalar, bajarilgan ishlar, o'rtacha reyting (GET /system/stats).
// Javob kelguncha yoki xatoda — DEFAULT_STATS ko'rinadi. Uch alohida rangli kartochka.
export default function StatsBand() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    fetch(ENDPOINTS.SYSTEM_STATS)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.response_data) {
          const { worker_count, order_count, average_rating } = data.response_data;
          setStats([
            { value: `${worker_count}+`, key: 'workers' },
            { value: `${order_count}+`, key: 'completedJobs' },
            { value: `${average_rating.toFixed(1)}★`, key: 'avgRating' },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <View style={s.row}>
      {stats.map((item) => {
        const look = LOOK[item.key];
        return (
          <View key={item.key} style={s.tile}>
            <View style={[s.icon, { backgroundColor: `${look.color}22` }]}>
              <MaterialCommunityIcons name={look.icon} size={20} color={look.color} />
            </View>
            <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>
              {item.value}
            </Text>
            <Text style={s.label} numberOfLines={2}>
              {t(`app.stats.${item.key}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 22 },
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  label: { fontSize: 11, color: COLORS.gray, marginTop: 3, textAlign: 'center' },
});
