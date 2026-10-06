import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { ENDPOINTS } from '../../../constants/config';
import { useLanguage } from '../../../context/LanguageContext';
import { DEFAULT_STATS } from '../constants';

// Umumiy statistika: ustalar, bajarilgan ishlar, o'rtacha reyting (GET /system/stats).
// Javob kelguncha yoki xatoda — DEFAULT_STATS ko'rinadi.
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
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 32,
        marginBottom: 28,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        paddingVertical: 18,
        flexDirection: 'row',
      }}
    >
      {stats.map((item, i) => (
        <View
          key={item.key}
          style={{
            flex: 1,
            alignItems: 'center',
            borderRightWidth: i < 2 ? 1 : 0,
            borderRightColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Text style={{ fontSize: 19, fontWeight: '800', color: COLORS.white }}>{item.value}</Text>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.gray,
              marginTop: 3,
              textAlign: 'center',
              paddingHorizontal: 4,
            }}
          >
            {t(`app.stats.${item.key}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
